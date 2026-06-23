import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { type } = await req.json();

    if (!["candidate", "employer"].includes(type)) {
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("resumePortal");
    
    
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { type: type } }
    );

    return NextResponse.json({ success: true, message: "Type updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}