import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    
    const { id } = await params; 
   

    const client = await clientPromise;
    const db = client.db("resumePortal");
    const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

    const _id = new ObjectId(id);
    const files = await bucket.find({ _id }).toArray();

    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(_id);

    return new Response(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });

  } catch (error) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
