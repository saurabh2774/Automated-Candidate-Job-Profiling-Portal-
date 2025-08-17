import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("resumePortal");

    const matches = await db.collection("matchedApplications")
      .find({})
      .sort({ sentAt: -1 })
      .toArray();

    return NextResponse.json(matches, { status: 200 });

  } catch (error) {
    console.error('Error fetching matched applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}