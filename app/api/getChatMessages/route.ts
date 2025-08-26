// /api/messages/route.ts
import { auth } from "@/lib/auth";
import File from "@/models/File.Model";
import Message from "@/models/Message.Model";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id

    const fileInfo = await File.findOne({ userId })
    const fileId = fileInfo?._id

    const query: any = {userId};
    if (fileId) query.fileId = fileId;

    const messages = await Message.find(query).sort({ createdAt: 1 }).lean();

    if (!messages.length) {
      return NextResponse.json({ success: false, message: "No messages found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Retrieved messages successfully",
      messages,
    });
  } catch (error) {
    console.error("Error Retrieving Messages:", error);
    return NextResponse.json(
      { success: false, message: "Error retrieving messages", error: String(error) },
      { status: 500 }
    );
  }
}
