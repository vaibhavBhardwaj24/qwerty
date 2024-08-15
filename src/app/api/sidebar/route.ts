import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import {
  collaborators,
  files,
  folders,
  users,
  workspace,
} from "../../../../migrations/schema";
import { and, eq, isNull } from "drizzle-orm";
import { alias, PgColumn } from "drizzle-orm/pg-core";
// import { alias } from "drizzle-orm/mysql-core";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      console.log("No ID provided");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Workspace ID:", workspaceId);

    // Query the database and join tables, filtering by the provided workspaceId
    const owner = alias(users, "owner");
    const result = await db
      .select({
        workspaceId: workspace.id,
        workspaceTitle: workspace.title,
        workspaceIcon: workspace.iconId,
        workspacePrivate: workspace.private,
        // ownerEmail: owner.email,
        // ownerName: owner.full_name,
        ownerId: owner.id,
        // ownerAvatar: owner.avatar_url,
        folderId: folders.id,
        folderTitle: folders.title,
        folderIcon: folders.iconId,
        folderTrash: folders.inTrash,
        collaboratorId: collaborators.collabId,
        collId: collaborators.id,
        collaboratorEmail: users.email,
        collaboratorsName: users.full_name,
        collaboratorAvatar: users.avatar_url,
      })
      .from(workspace)
      .leftJoin(folders, eq(folders.workspaceId, workspace.id))
      .leftJoin(collaborators, eq(collaborators.workspaceId, workspace.id))
      .leftJoin(users, eq(users.id, collaborators.collabId))
      .leftJoin(owner, eq(owner.id, workspace.owner))
      .where(and(eq(workspace.id, workspaceId), isNull(folders.inTrash)));
    console.log(result, "get workspace api call");

    // Aggregating collaborators
    const workspaceMap = new Map();

    result.forEach((row) => {
      const {
        workspaceId,
        workspaceTitle,
        workspaceIcon,
        workspacePrivate,
        // ownerEmail,
        // ownerAvatar,
        // ownerId,
        // ownerName,
        ownerId,
        folderId,
        folderTitle,
        folderIcon,
        folderTrash,
        collaboratorId,
        collaboratorEmail,
        collaboratorAvatar,
        collaboratorsName,
        collId,
      } = row;

      if (!workspaceMap.has(workspaceId)) {
        workspaceMap.set(workspaceId, {
          workspaceId,
          workspaceTitle,
          workspaceIcon,
          workspacePrivate,
          ownerId,
          // owner: {
          //   ownerEmail,
          //   ownerAvatar,
          //   ownerId,
          //   ownerName,
          // },
          folders: [],
          collaborators: [],
        });
      }

      const workspaceEntry = workspaceMap.get(workspaceId);

      if (
        folderId &&
        !workspaceEntry.folders.some((folder:any) => folder.folderId === folderId)
      ) {
        workspaceEntry.folders.push({
          folderId,
          folderTitle,
          folderIcon,
          folderTrash,
        });
      }

      if (
        collId &&
        !workspaceEntry.collaborators.some(
          (collab:any) => collab.collaboratorId === collaboratorId
        )
      ) {
        workspaceEntry.collaborators.push({
          collaboratorId,
          collaboratorEmail,
          collaboratorAvatar,
          collaboratorsName,
          collId,
        });
      }
    });

    const aggregatedResult = Array.from(workspaceMap.values());
    console.log(aggregatedResult);

    return NextResponse.json({
      success: true,
      workspace: aggregatedResult,
    });
  } catch (error) {
    console.error("Error fetching workspace data:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
