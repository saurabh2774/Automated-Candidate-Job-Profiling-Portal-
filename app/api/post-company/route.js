import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('resumePortal');

        // Create document with exact field names matching the schema
        const document = {
            name: body.name,
            jobTitle: body.jobTitle,
            location: body.location,
            skills: body.skills,
            experienceLevel: body.experienceLevel,
            email: body.email
        };

        const result = await db.collection('companyData').insertOne(document);
        
        return NextResponse.json({ 
            message: 'Company posted successfully',
            success: true,
            data: result 
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to post company data' },
            { status: 500 }
        );
    }
}
