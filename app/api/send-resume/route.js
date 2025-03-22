import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import nodemailer from "nodemailer";
import streamToBuffer from "stream-to-buffer";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("resumePortal");

        const applications = await db.collection("applications").find({ autoApply: true }).toArray();
        const companies = await db.collection("companyData").find().toArray();

        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "your_email@gmail.com",
                pass: "your_email_password"
            }
        });

        const matchedResults = [];

        for (const application of applications) {
            for (const company of companies) {
                const matchedSkills = application.skills.filter(skill =>
                    company.skills.includes(skill)
                );

                const experienceMatch = application.experienceLevel.toLowerCase() === company.experienceLevel.toLowerCase();

                if (matchedSkills.length > 0 && experienceMatch) {
                    const resumeFile = await db.collection('resumes.files').findOne({ _id: application.resumeId });

                    if (resumeFile) {
                        const downloadStream = bucket.openDownloadStream(application.resumeId);

                        streamToBuffer(downloadStream, async (err, buffer) => {
                            if (err) {
                                console.error(`Error fetching resume for ${application.fullName}`);
                                return;
                            }

                            await transporter.sendMail({
                                from: '"Job Portal" <your_email@gmail.com>',
                                to: company.email,
                                subject: `Resume Submission for ${company.jobTitle}`,
                                text: `Dear Hiring Manager at ${company.name},\n\n
I hope this message finds you well. I am writing to express my interest in the ${company.jobTitle} role at your esteemed organization. Please find my resume attached for your consideration.

I believe my skills and experience align well with the requirements for this position. I would be grateful for the opportunity to discuss my application further.

Looking forward to hearing from you soon.

Best regards,
${application.fullName}
                                `,
                                attachments: [
                                    {
                                        filename: `${application.fullName}_Resume.pdf`,
                                        content: buffer
                                    }
                                ]
                            });

                            console.log(`Resume sent to ${company.name} for ${application.fullName}`);

                            matchedResults.push({
                                applicantName: application.fullName,
                                companyName: company.name,
                                matchedSkills,
                                companyEmail: company.email
                            });
                        });
                    }
                }
            }
        }

        res.status(200).json({ message: "Resumes successfully sent!", matches: matchedResults });

    } catch (error) {
        console.error("Error during email sending:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
