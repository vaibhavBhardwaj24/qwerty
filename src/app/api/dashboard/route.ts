import db from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { collaborators, workspace } from "../../../../migrations/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId }: { userId: string } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required",
      });
    }

    // // Fetch workspaces where the user is a collaborator
    // const collaboratedWorkspace = await db
    //   .select({ workspaceId: collaborators.workspaceId })
    //   .from(collaborators)
    //   .where(eq(collaborators.collabId, userId));

    // const workspaceIdsArray = collaboratedWorkspace.map((ws) => ws.workspaceId);

    // let collabs: any[] = [];

    // if (workspaceIdsArray.length > 0) {
    //   collabs = await db
    //     .select({
    //       id: workspace.id,
    //       title: workspace.title,
    //       iconId: workspace.iconId,
    //     })
    //     .from(workspace)
    //     .where(inArray(workspace.id, workspaceIdsArray));
    // }

    // Fetch workspaces owned by the user
    const workspaces = await db
      .select({
        id: workspace.id,
        title: workspace.title,
        iconId: workspace.iconId,
      })
      .from(workspace)
      .where(eq(workspace.owner, userId));
      console.log();
      
    return NextResponse.json({
      success: true,
      workspace: workspaces.length > 0 ? workspaces : null,
      // collabs: collabs.length > 0 ? collabs : null,
      user: userId,
    });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ success: false, message: error });
  }
}
