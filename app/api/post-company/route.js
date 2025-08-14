import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db("resumePortal");
        const data = await request.json();

        const result = await db.collection('companyData').insertOne(data);

        return NextResponse.json({ message: 'Data inserted successfully', id: result.insertedId }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'Error inserting data', error: error.message }, { status: 500 });
    }
}
