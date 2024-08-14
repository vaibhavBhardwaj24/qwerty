import { NextRequest, NextResponse } from "next/server";
import {
  collaborators,
  files,
  folders,
  users,
  workspace,
} from "../../../../migrations/schema";

import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "@/lib/supabase/db";
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
    const result = await db
      .select({
        workspaceTitle: workspace.title,
        folderId: folders.id,
        folderTitle: folders.title,
        folderIcon: folders.iconId,
        fileId: files.id,
        filesTitle: files.title,
        filesIcon: files.iconId,
      })
      .from(workspace)
      .leftJoin(
        folders,
        and(eq(folders.workspaceId, workspace.id), isNotNull(folders.inTrash))
      )
      .leftJoin(
        files,
        and(eq(files.workspaceId, workspaceId), isNotNull(files.inTrash))
      )
      .where(eq(workspace.id, workspaceId));

    console.log(result);
    const trashMap = new Map();

    result.forEach((row) => {
      const {
        workspaceTitle,
        folderId,
        folderTitle,
        folderIcon,
        fileId,
        filesIcon,
        filesTitle,
      } = row;

      if (!trashMap.has(workspaceId)) {
        trashMap.set(workspaceId, {
          workspaceId,
          workspaceTitle,
          folders: [],
          files: [],
        });
      }
      const trashEntry = trashMap.get(workspaceId);

      if (folderId) {
        trashEntry.folders.push({
          folderId,
          folderTitle,
          folderIcon,
        });
      }
      if (fileId) {
        trashEntry.files.push({
          fileId,
          filesTitle,
          filesIcon,
        });
      }
    });

    const aggregatedResult = Array.from(trashMap.values());
    console.log(aggregatedResult);

    return NextResponse.json({
      success: true,
      trash: aggregatedResult,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: error,
    });
  }
}
