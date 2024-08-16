import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { files } from "../../../../migrations/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { folderId } = await req.json();
    if (!folderId) {
      console.log("No ID provided");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    const result = await db
      .select({
        filesTitle: files.title,
        filesIcon: files.iconId,
        filesOwner: files.owner,
        filesId: files.id,
      })
      .from(files)
      .where(and(eq(files.folderId, folderId), isNull(files.inTrash)));
      console.log(result);
      
    return NextResponse.json({
      success: true,
      files: result,
    });
  } catch (error) {
    console.error("Error fetching workspace data:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
