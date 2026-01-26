import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import nodemailer from "nodemailer";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// This is the URL for your Python AI Service
const AI_SERVICE_URL = "http://localhost:8000";

// Helper function to convert stream to buffer
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
        }

        const formData = await req.formData();
        const client = await clientPromise;
        const db = client.db("resumePortal");

        const application = {
            
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            desiredJobTitle: formData.get('desiredJobTitle'),
            skills: formData.get('skills').split(',').map(skill => skill.trim()),
            experienceLevel: formData.get('experienceLevel'),
            autoApply: formData.get('autoApply') === 'true',
            User_id: session.user.email
        };

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
        
        const result = await db.collection("applications")
        .insertOne(application);
        const newResumeGridFSId = application.resumeId.toString();
        
        let matchesCount = 0;

        if (application.autoApply) {
            
            // 1. Tell the AI service to parse the new resume
            try {
                const parseResponse = await fetch(`${AI_SERVICE_URL}/parse`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeId: newResumeGridFSId })
                });

                if (!parseResponse.ok) {
                    const errorText = await parseResponse.text();
                    console.error("AI Parse Service failed:", errorText);
                    throw new Error(`AI service failed to parse resume: ${errorText}`);
                }
            } catch (e) {
                console.error("Failed to call AI parse service:", e.message);
                throw new Error(`AI service connection failed or parse error: ${e.message}`);
            }

            const companies = await db.collection("companyData").find().toArray();
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            
            const resumeBufferForEmail = Buffer.from(await resumeFile.arrayBuffer());

            for (const company of companies) {
                const matchedSkills = application.skills.filter(skill =>
                    company.skills.includes(skill)
                );

                // 1. Check Experience Level
                const experienceMatch = application.experienceLevel.toLowerCase() === company.experienceLevel.toLowerCase();

                // 2. Check Job Title
                // Clean both strings (lowercase and remove extra spaces) to prevent mismatches
                const appTitle = application.desiredJobTitle.toLowerCase().trim();
                const companyTitle = company.jobTitle.toLowerCase().trim();
                const titleMatch = (appTitle === companyTitle); 

                // 3. Check Skills Match
                const skillsMatch = matchedSkills.length > 0;

                // 4. If any one doesn't match, skip this company
                if (!experienceMatch || !titleMatch || !skillsMatch) {
                    console.log(`Skipping match for ${company.name}: Exp? ${experienceMatch}, Title? ${titleMatch}, Skills? ${skillsMatch}`);
                    continue; // Go to the next company
                }

                // This code below will now *only* run if both experience and title match
                
                try {
                    // 3. Tell the AI service to score
                    const scoreResponse = await fetch(`${AI_SERVICE_URL}/score`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            resumeId: newResumeGridFSId,
                            companyId: company._id.toString()
                        })
                    });
                    
                    if (!scoreResponse.ok) {
                        console.error(`Failed to score for company ${company._id}: ${await scoreResponse.text()}`);
                        continue; 
                    }

                    const scoreData = await scoreResponse.json();
                    const classification = scoreData.class;
                    const score = scoreData.score;

                    // 4. Final check on AI score
                    if (classification === 'MOS' || classification === 'MDS') {

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
                                status: 'pending'
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
                            
                            await Promise.all([
                                db.collection("matchedApplications").updateOne(
                                    { _id: matchData._id },
                                    { $set: { status: 'sent' } }
                                ),
                                db.collection("applications").updateOne(
                                    { _id: result.insertedId },
                                    { $set: { status: 'sent' } }
                                )
                            ]);
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
