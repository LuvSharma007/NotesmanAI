import { auth } from "@/lib/auth";
import File from "@/models/File.Model";
import { success } from "better-auth";
import { NextResponse } from "next/server";

export async function GET(request:Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user.id
    const userFiles = await File.find({ userId }).sort({ uploadedAt: -1 }).lean();

    if (!userFiles || userFiles.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: "No files found"
      },{ status: 404 });
    }

    console.log("Retrieving user's info successfully",userFiles);
    return NextResponse.json({
      success: true,
      message: userFiles.length
        ? "Retrieved all files info successfully"
        : "No files found",
      collections:userFiles || []
    }, { status: 200 });

  } catch (error) {
    console.log("Error Retrieving Collections:", error);

    return NextResponse.json({
      success: false,
      message: "Error retrieving collections",
      error: String(error)
    }, { status: 500 });
  }
}
