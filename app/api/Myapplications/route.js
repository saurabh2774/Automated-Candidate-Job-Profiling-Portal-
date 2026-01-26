import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
// Ensure this import points to the file we fixed in Step 1
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Debugging: Check if session is actually being retrieved
    if (!session) {
      console.log("No session found via getServerSession");
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("resumePortal");

    const applications = await db.collection("matchedApplications")
      .find({ User_id: session.user.email })
      .sort({ sentAt: -1 })
      .toArray();

    const enhancedApplications = await Promise.all(applications.map(async (app) => {
      let companyDetails = null;
      try {
        if (app.companyId) {
          companyDetails = await db.collection("companyData").findOne({ _id: new ObjectId(app.companyId) });
        }
      } catch (e) {
        console.error("Error fetching company details:", e);
      }

      const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      const registeredOn = app.sentAt ? new Date(app.sentAt).toLocaleDateString('en-US', dateOptions) : 'N/A';
      const displayScore = app.suitabilityScore ? Math.round(app.suitabilityScore * 100) : 0;

      let visualClass = 'B';
      if (app.classification === 'MOS') visualClass = 'A';
      else if (app.classification === 'MDS') visualClass = 'B';
      else visualClass = 'C';

      return {
        id: app._id.toString(),
        companyId: app.companyId.toString(),
        company: app.companyName || "Unknown Company",
        role: app.jobTitle || "Unknown Role",
        applicant: app.fullName,
        registeredOn: registeredOn,
        sentAt: app.sentAt || null,
        deadline: companyDetails?.deadline || "Open",
        status: app.status || "Pending",
        logo: companyDetails?.logo || null,
        emailNotifications: false,
        sustainability: {
          class: visualClass,
          score: displayScore
        },
        steps: [
          { name: "AI Match" },
          { name: "Applied" }
        ]
      };
    }));

    return NextResponse.json({ success: true, applications: enhancedApplications });

  } catch (error) {
    console.error("Error in GET /api/Myapplications:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}