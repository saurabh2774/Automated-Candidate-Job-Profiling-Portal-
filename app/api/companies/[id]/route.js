import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
    try {
        const { id } = await params; 
        const client = await clientPromise;
        const db = client.db('resumePortal');

        // Validate ID
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }

        const company = await db.collection('companyData').findOne({ _id: new ObjectId(id) });

        if (!company) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // --- NEW LOGIC: Check if current user has applied ---
        const session = await getServerSession(authOptions);
        let hasApplied = false;

        if (session && session.user) {
            // Check matchedApplications for this user and company
            const application = await db.collection('matchedApplications').findOne({
                User_id: session.user.email,
                companyId: new ObjectId(id)
            });
            hasApplied = !!application;
        }

        // Return company data AND the hasApplied flag
        return NextResponse.json({ ...company, hasApplied });

    } catch (error) {
        console.error('Error fetching company:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
