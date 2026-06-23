import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// const AI_SERVICE_URL = "jobhunt-ai-service-production.up.railway.app";
const AI_SERVICE_URL = "http://localhost:8000";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
        }

        const formData = await req.formData();
        const client = await clientPromise;
        const db = client.db("resumePortal");

        const targetCompanyId = formData.get('targetCompanyId');

        const application = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            desiredJobTitle: formData.get('desiredJobTitle'),
            skills: formData.get('skills').split(',').map(skill => skill.trim()),
            experienceLevel: formData.get('experienceLevel'),
            autoApply: formData.get('autoApply') === 'true',
            User_id: session.user.email,
            targetCompanyId: targetCompanyId || null // Track direct vs auto
        };

        // Resume Upload Logic
        const resumeFile = formData.get('resume');
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });
        const uploadStream = bucket.openUploadStream(resumeFile.name);
        const buffer = Buffer.from(await resumeFile.arrayBuffer());

        await new Promise((resolve, reject) => {
            uploadStream.on('error', (error) => reject(error));
            uploadStream.on('finish', () => {
                application.resumeId = uploadStream.id; 
                resolve(uploadStream.id);
            });
            uploadStream.end(buffer);
        });
        
        const result = await db.collection("applications").insertOne(application);
        const newResumeGridFSId = application.resumeId.toString();
        
        let matchesCount = 0;

        // MATCHING LOGIC
        // Only run if AutoApply is ON OR if there is a specific Target Company
        if (application.autoApply || targetCompanyId) {
            
            // 1. Parse Resume
            try {
                const parseResponse = await fetch(`${AI_SERVICE_URL}/parse`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeId: newResumeGridFSId })
                });

                if (!parseResponse.ok) {
                    throw new Error(`AI service failed to parse resume: ${await parseResponse.text()}`);
                }
            } catch (e) {
                console.error("Failed to call AI parse service:", e.message);
                // Proceeding without parsing might break scoring, but we can catch that later
            }

            // 2. Determine Scope (Single Company vs All Companies)
            let companies = [];
            if (targetCompanyId) {
                // CASE A: Direct Application - Fetch ONLY the specific company
                const specificCompany = await db.collection("companyData").findOne({ _id: new ObjectId(targetCompanyId) });
                if (specificCompany) {
                    companies = [specificCompany];
                }
            } else {
                // CASE B: Auto Apply - Fetch ALL companies BUT exclude previously applied ones
                
                // a. Fetch all available companies
                const allCompanies = await db.collection("companyData").find().toArray();

                // b. Fetch all applications this user has already made
                const userPastApplications = await db.collection("matchedApplications")
                    .find({ User_id: session.user.email })
                    .project({ companyId: 1 }) // Only need the IDs
                    .toArray();

                // c. Create a Set of applied Company IDs for fast lookup
                const appliedCompanyIds = new Set(userPastApplications.map(app => app.companyId.toString()));

                // d. Filter companies: Keep only those NOT in the applied list
                companies = allCompanies.filter(company => !appliedCompanyIds.has(company._id.toString()));
            }

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            
            const resumeBufferForEmail = Buffer.from(await resumeFile.arrayBuffer());

            // 3. Process Companies
            for (const company of companies) {
                
                // --- FILTER LOGIC ---
                // If it is NOT a direct application (i.e. it is Auto Apply), enforce strict filters
                if (!targetCompanyId) {
                    // Check Experience
                    const experienceMatch = application.experienceLevel.toLowerCase() === company.experienceLevel.toLowerCase();
                    // Check Job Title
                    const appTitle = application.desiredJobTitle.toLowerCase().trim();
                    const companyTitle = company.jobTitle.toLowerCase().trim();
                    const titleMatch = (appTitle === companyTitle); 

                    if (!experienceMatch || !titleMatch) {
                        continue; // Skip this company
                    }
                }
                // If it IS a direct application, we SKIP the filters above and proceed to scoring/emailing directly.

                try {
                    // 4. AI Scoring
                    const scoreResponse = await fetch(`${AI_SERVICE_URL}/score`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            resumeId: newResumeGridFSId,
                            companyId: company._id.toString()
                        })
                    });
                    
                    if (!scoreResponse.ok) continue;

                    const scoreData = await scoreResponse.json();
                    const classification = scoreData.class;
                    const score = scoreData.score;
                    const matchedSkills = application.skills; 

                    // 5. Save Match & Send Email
                    // For Direct Apply: We accept regardless of score (or you can add a threshold)
                    // For Auto Apply: We only accept 'MOS' or 'MDS'
                    const isAutoMatch = (classification === 'MOS' || classification === 'MDS');
                    
                    if (targetCompanyId || isAutoMatch) {

                        // Double check to ensure we don't insert duplicates for the current run
                        const existingMatch = await db.collection("matchedApplications").findOne({
                            applicationId: result.insertedId,
                            companyId: company._id,
                        });

                        if (!existingMatch) {
                            const matchData = {
                                User_id: application.User_id,
                                applicationId: result.insertedId,
                                companyId: company._id,
                                fullName: application.fullName,
                                companyName: company.name,
                                jobTitle: company.jobTitle,
                                matchedSkills: matchedSkills,
                                suitabilityScore: score,
                                classification: classification,
                                sentAt: new Date(),
                                status: 'sent',
                                type: targetCompanyId ? 'direct' : 'auto'
                            };

                            await db.collection("matchedApplications").insertOne(matchData);
                            matchesCount++;

                            await transporter.sendMail({
                                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                                to: company.email,
                                subject: `New Application for ${company.jobTitle} from ${application.fullName}`,
                                text: `A new candidate has applied for the ${company.jobTitle} position.\n\n` +
                                      `Candidate: ${application.fullName}\n` +
                                      `Suitability: ${classification} (Score: ${score.toFixed(2)})\n` +
                                      `Experience: ${application.experienceLevel}\n\n` +
                                      `Their resume is attached.`,
                                attachments: [{
                                    filename: `${application.fullName}_Resume.pdf`,
                                    content: resumeBufferForEmail,
                                    contentType: 'application/pdf'
                                }]
                            });
                        }
                    }
                } catch (e) {
                    console.error(`Error during matching loop for company ${company._id}:`, e);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Application submitted successfully",
            matches: matchesCount
        }, { status: 200 });

    } catch (error) {
        console.error("Error in POST /api/resume-upload:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "An error occurred",
            error: error
        }, { status: 500 });
    }
}