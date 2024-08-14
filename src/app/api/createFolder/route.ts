import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { folders } from "../../../../migrations/schema";

export async function POST(req: NextRequest,res: NextResponse) {
  const { title, workspaceId, iconId, bannerURL, owner,data } = await req.json();
  try {
    const result =await db.insert(folders).values({
      owner: owner,
      title: title,
      iconId: iconId,
      bannerURL: bannerURL,
      workspaceId: workspaceId,
      data:data
    });
    console.log(result);
    
    return NextResponse.json({ success: true, res: result });
  } catch (error) {
    console.error("Error inserting data:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
