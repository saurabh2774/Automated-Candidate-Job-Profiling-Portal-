import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
   
    const { id } = await params; 
    
    const client = await clientPromise;
    const db = client.db("resumePortal");

    // 1. Get all matches for this company
    const matches = await db.collection("matchedApplications")
      .find({ companyId: new ObjectId(id) })
      .sort({ suitabilityScore: -1 }) // Show highest score first
      .toArray();

    // 2. Enrich with data from the original 'applications' collection (to get resumeId and email)
    const applicants = await Promise.all(matches.map(async (match) => {
        const applicationData = await db.collection("applications").findOne({ _id: match.applicationId });
        
        // Calculate display score
        const displayScore = match.suitabilityScore ? Math.round(match.suitabilityScore * 100) : 0;
        
        let visualClass = 'B';
        if (match.classification === 'MOS') visualClass = 'A';
        else if (match.classification === 'MDS') visualClass = 'B';
        else visualClass = 'C';

        return {
            id: match._id.toString(),
            name: match.fullName,
            email: applicationData?.email || "N/A", // From applications collection
            role: match.jobTitle,
            score: displayScore,
            visualClass: visualClass,
            resumeId: applicationData?.resumeId?.toString(), // GridFS ID
            appliedAt: match.sentAt ? new Date(match.sentAt).toLocaleDateString() : "N/A"
        };
    }));

    return NextResponse.json({ success: true, applicants });

  } catch (error) {
    console.error("Error in GET /api/job-applicants:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
