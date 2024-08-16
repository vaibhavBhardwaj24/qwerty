import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import {
  collaborators,
  folders,
  todo,
  users,
  workspace,
} from "../../../../migrations/schema";
import { and, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
    const owner = alias(users, "owner");
    const result = await db
      .select({
        workspaceId: workspace.id,
        workspaceTitle: workspace.title,
        workspaceIcon: workspace.iconId,
        workspaceData: workspace.data,
        workspaceCreatedAt: workspace.createdAt,
        workspaceBanner: workspace.bannerURL,
        workspacePrivate: workspace.private,
        ownerEmail: owner.email,
        ownerName: owner.full_name,
        ownerId: owner.id,
        ownerAvatar: owner.avatar_url,
        folderId: folders.id,
        folderTitle: folders.title,
        folderIcon: folders.iconId,
        // todoId: todo.id,
        // todoCompleted: todo.isCompleted,
        // todoUrgent: todo.isUrgent,
        // todoTask: todo.task,
        // todoDueDate: todo.dueDate,
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
      // .leftJoin(todo, eq(todo.workspaceId, workspace.id))
      .leftJoin(owner, eq(owner.id, workspace.owner))
      .where(and(eq(workspace.id, workspaceId), isNull(folders.inTrash)));

    const workspaceMap = new Map();

    result.forEach((row) => {
      const {
        workspaceId,
        workspaceTitle,
        workspaceIcon,
        workspaceData,
        workspaceCreatedAt,
        workspaceBanner,
        workspacePrivate,
        ownerEmail,
        ownerAvatar,
        ownerId,
        ownerName,
        folderId,
        folderTitle,
        folderIcon,
        // todoId,
        // todoCompleted,
        // todoUrgent,
        // todoTask,
        // todoDueDate,
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
          workspaceData,
          workspaceCreatedAt,
          workspaceBanner,
          workspacePrivate,
          // owner: {
          //   ownerEmail,
          //   ownerAvatar,
          //   ownerId,
          //   ownerName,
          // },
          folders: new Set(),
          // todos: new Set(),
          owner: new Set(),
          collaborators: new Set(),
        });
      }

      const workspaceEntry = workspaceMap.get(workspaceId);

      if (folderId) {
        workspaceEntry.folders.add(
          JSON.stringify({
            folderId,
            folderTitle,
            folderIcon,
          })
        );
      }

      // if (todoId) {
      //   workspaceEntry.todos.add(
      //     JSON.stringify({
      //       todoId,
      //       todoCompleted,
      //       todoUrgent,
      //       todoTask,
      //       todoDueDate,
      //     })
      //   );
      // }
      if (ownerId) {
        workspaceEntry.owner.add(
          JSON.stringify({
            ownerId,
            ownerAvatar,
            ownerEmail,
            ownerName,
          })
        );
      }
    });

    // Convert Sets to Arrays and parse the JSON strings back to objects
    const aggregatedResult = Array.from(workspaceMap.values()).map(
      (workspace) => ({
        ...workspace,
        folders: Array.from(workspace.folders as string[]).map((folder) =>
          JSON.parse(folder)
        ),
        // todos: Array.from(workspace.todos as string[]).map((todo) => JSON.parse(todo)),
        owner: Array.from(workspace.owner as string[]).map((owner) =>
          JSON.parse(owner)
        ),
      })
    );
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
