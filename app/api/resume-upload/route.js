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

        const application = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            desiredJobTitle: formData.get('desiredJobTitle'),
            skills: formData.get('skills').split(',').map(skill => skill.trim()),
            experienceLevel: formData.get('experienceLevel'),
            autoApply: formData.get('autoApply') === 'true',
        };

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
        
        application.resumeId = uploadStream.id;

        const result = await db.collection("applications").insertOne(application);

        if (application.autoApply) {
            const companies = await db.collection("companyData").find().toArray();

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            for (const company of companies) {
                const matchedSkills = application.skills.filter(skill =>
                    company.skills.includes(skill)
                );

                const experienceMatch = application.experienceLevel.toLowerCase() === company.experienceLevel.toLowerCase();

                if (matchedSkills.length > 0 && experienceMatch) {
                    const existingMatch = await db.collection("matchedApplications").findOne({
                        applicationId: result.insertedId,
                        companyId: company._id,
                    });

                    if (!existingMatch) {
                        const matchData = {
                            applicationId: result.insertedId,
                            companyId: company._id,
                            fullName: application.fullName,
                            companyName: company.name,
                            jobTitle: company.jobTitle,
                            matchedSkills,
                            sentAt: new Date(),
                            status: 'pending'
                        };

                        await db.collection("matchedApplications").insertOne(matchData);

                        const resumeFileFromDB = await db.collection('resumes.files').findOne({ _id: application.resumeId });
                        if (resumeFileFromDB) {
                            try {
                                const downloadStream = bucket.openDownloadStream(application.resumeId);
                                const resumeBuffer = await streamToBuffer(downloadStream);

                                await transporter.sendMail({
                                    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                                    to: company.email,
                                    subject: `New Application for ${company.jobTitle} from ${application.fullName}`,
                                    text: `A new candidate has applied for the ${company.jobTitle} position.\n\nCandidate: ${application.fullName}\nMatched Skills: ${matchedSkills.join(', ')}\n\nTheir resume is attached.`,
                                    attachments: [
                                        {
                                            filename: `${application.fullName}_Resume.pdf`,
                                            content: resumeBuffer,
                                            contentType: 'application/pdf'
                                        }
                                    ]
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
                            } catch (err) {
                                console.error(`Error sending email for ${application.fullName}:`, err);
                            }
                        }
                    }
                }
            }
        }

        const matchesCount = await db.collection("matchedApplications").countDocuments({ applicationId: result.insertedId });

        return NextResponse.json({
            success: true,
            message: "Application submitted successfully",
            matches: matchesCount
        }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "An error occurred",
            error: error
        }, { status: 500 });
    }
}
