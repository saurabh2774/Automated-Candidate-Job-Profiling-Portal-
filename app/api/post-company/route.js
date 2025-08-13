import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function POST(request) {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db();
        const data = await request.json();

        const result = await db.collection('companyData').insertOne(data);

        client.close();

        return new Response(JSON.stringify({ message: 'Data inserted successfully', id: result.insertedId }), {
            headers: { 'Content-Type': 'application/json' },
            status: 201
        });

    } catch (error) {
        return new Response(JSON.stringify({ message: 'Error inserting data', error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}