import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("resumePortal");
    
    const matches = await db.collection("matchedApplications")
      .find({})
      .sort({ sentAt: -1 })
      .toArray();

    await client.close();

    return new Response(JSON.stringify(matches), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error fetching matched applications:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
