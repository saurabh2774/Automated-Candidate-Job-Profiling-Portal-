import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import nodemailer from "nodemailer";
import { NextResponse } from 'next/server';


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
        const formData = await req.formData();
        const client = await clientPromise;
        const db = client.db("resumePortal");

        // Parse the form data
        const application = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            desiredJobTitle: formData.get('desiredJobTitle'),
            skills: formData.get('skills').split(',').map(skill => skill.trim()),
            experienceLevel: formData.get('experienceLevel'),
            autoApply: formData.get('autoApply') === 'true',
        };

        // Store resume file in GridFS
        const resumeFile = formData.get('resume');
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });
        const uploadStream = bucket.openUploadStream(resumeFile.name);
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        await new Promise((resolve, reject) => {
            uploadStream.end(buffer, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
        
        // Add resume file reference to application
        application.resumeId = uploadStream.id;

        // Store application in database
        const result = await db.collection("applications").insertOne(application);

        const applications = await db.collection("applications").find({ autoApply: true }).toArray();
        const companies = await db.collection("companyData").find().toArray();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const matchedResults = [];
        const matchPromises = [];

        // Only process the current application instead of all applications
        for (const company of companies) {
            const matchedSkills = application.skills.filter(skill =>
                company.skills.includes(skill)
            );

            const experienceMatch = application.experienceLevel.toLowerCase() === company.experienceLevel.toLowerCase();

            if (matchedSkills.length > 0 && experienceMatch) {
                // Check if this resume was already sent to this company
                const existingMatch = await db.collection("matchedApplications").findOne({
                    applicationId: result.insertedId,  // Use current application ID
                    companyId: company._id,
                });

                if (!existingMatch) {
                    const matchData = {
                        applicationId: result.insertedId,  // Use current application ID
                        companyId: company._id,
                        fullName: application.fullName,
                        companyName: company.name,
                        jobTitle: company.jobTitle,
                        matchedSkills,
                        sentAt: new Date(),
                        status: 'pending'
                    };

                    matchPromises.push(
                        db.collection("matchedApplications").insertOne(matchData)
                    );

                    matchedResults.push({
                        applicantName: application.fullName,
                        companyName: company.name,
                        matchedSkills,
                        companyEmail: company.email,
                        companyId: company._id
                    });
                }
            }
        }

        // Wait for all new matches to be stored
        if (matchPromises.length > 0) {
            await Promise.all(matchPromises);
        }

        // Now proceed with email sending
        for (const match of matchedResults) {
            const resumeFile = await db.collection('resumes.files').findOne({ _id: application.resumeId });
            if (resumeFile) {
                try {
                    const downloadStream = bucket.openDownloadStream(application.resumeId);
                    const buffer = await streamToBuffer(downloadStream);

                    await transporter.sendMail({
                        from: '"Job Portal" dhulerohit970@gmail.com',
                        to: match.companyEmail,
                        subject: `Resume Submission for ${match.companyName}`,
                        text: `Dear Hiring Manager at ${match.companyName},

I hope this message finds you well. I am writing to express my interest in a role at your esteemed organization. Please find my resume attached for your consideration.

My skills (${match.matchedSkills.join(', ')}) align well with your requirements. I would be grateful for the opportunity to discuss my application further.

Looking forward to hearing from you soon.

Best regards,
${application.fullName}`,
                        attachments: [
                            {
                                filename: `${application.fullName}_Resume.pdf`,
                                content: buffer
                            }
                        ]
                    });

                    // Update match status after email is sent
                    await db.collection("matchedApplications").updateOne(
                        { 
                            applicationId: application._id,
                            companyId: match.companyId 
                        },
                        { 
                            $set: { status: 'sent' } 
                        }
                    );

                    console.log(`Resume sent to ${match.companyName} for ${application.fullName}`);
                } catch (err) {
                    console.error(`Error processing resume for ${application.fullName}:`, err);
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Application submitted successfully",
            matches: matchedResults.length // Return matches count directly
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message || "An error occurred",
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
