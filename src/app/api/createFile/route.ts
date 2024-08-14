import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { files } from "../../../../migrations/schema";

export async function POST(req: NextRequest, res: NextResponse) {
  const { workspaceId, owner, title, iconId, folderId } = await req.json();
  try {
    const result = await db.insert(files).values({
      workspaceId: workspaceId,
      owner: owner,
      title: title,
      iconId: iconId,
      folderId: folderId,
    });
    console.log(result);
    return NextResponse.json({ success: true, res: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
