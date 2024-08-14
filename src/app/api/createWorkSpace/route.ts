import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { workspace } from "../../../../migrations/schema";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // Parse the JSON body
    const { title, ownerID, iconId, privateMode, bannerURL, data } =
      await req.json();

    // Log the received values
    console.log("Received data:", { title, ownerID, iconId });

    // Check if any of the required values are missing
    if (!title || !ownerID || !iconId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    if (bannerURL != "") {
      const result = await db.insert(workspace).values({
        title: title,
        iconId: iconId,
        owner: ownerID,
        private: privateMode,
        bannerURL: bannerURL,
        data: data,
      });

      return NextResponse.json({ success: true, res: result });
    }
    const result = await db.insert(workspace).values({
      title: title,
      iconId: iconId,
      owner: ownerID,
      private: privateMode,
      data: data,
    });

    return NextResponse.json({ success: true, res: result });
    // Insert data into the database
  } catch (error) {
    console.error("Error inserting data:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
