import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("resumePortal");

    // Fetch companies posted by the logged-in user
    // Assumes you save 'User_id' or 'email' in companyData when posting
    const myCompanies = await db.collection("companyData")
      .find({ User_id: session.user.email }) 
      .sort({ createdAt: -1 })
      .toArray();

    const formattedCompanies = myCompanies.map(company => {
      const deadline = company.applicationDeadline || company.deadline;
      const deadlineDate = deadline ? new Date(deadline) : null;
      const now = new Date();
      const isClosed = deadlineDate && deadlineDate < now;
      
      return {
        id: company._id.toString(),
        company: company.name,
        role: company.jobTitle,
        logo: company.logo,
        deadline: deadlineDate ? deadlineDate.toLocaleDateString() : "Open",
        postedOn: company.postedAt ? new Date(company.postedAt).toLocaleDateString() : (company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "Recently"),
        createdAt: company.createdAt || company.postedAt || null,
        postedBy: session.user.email || session.user.name || "You",
        status: isClosed ? "Closed" : "Active"
      };
    });

    return NextResponse.json({ success: true, companies: formattedCompanies });

  } catch (error) {
    console.error("Error in GET /api/my-posted-jobs:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}