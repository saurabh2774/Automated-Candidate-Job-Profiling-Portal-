import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("resumePortal");
        const data = await request.json();

        
        const companyDataWithUser = {
            User_id: session.user.email,
            name: data.name,
            jobTitle: data.jobTitle,
            location: data.location,
            skills: data.skills, // Kept for AI matching
            experienceLevel: data.experienceLevel,
            email: data.email,
            
            
            jobDescription: data.jobDescription, // Short summary
            responsibilities: data.responsibilities, // Bullet points
            requirements: data.requirements, // Bullet points
            
        
            salary: data.salary || "Unpaid",
            duration: data.duration,
            workMode: data.workMode, // Remote, On-site
            schedule: data.schedule, // Full-time, Part-time
            applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
            eligibility: data.eligibility,
            postedAt: new Date()
        };

        const result = await db.collection('companyData').insertOne(companyDataWithUser);
        return NextResponse.json({ message: 'Data inserted successfully', id: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ message: 'Error inserting data', error: error.message }, { status: 500 });
    }
}