import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}