"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole } from "@/app/types/roles";
import { hasMinimumRole } from "@/lib/workspace-auth";
import { revalidatePath } from "next/cache";

export async function createWorkspace(data: { name: string }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { name } = data;

    if (!name) {
      throw new Error("Workspace name is required");
    }

    // Get user details from Clerk
    const user = await currentUser();

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.owner,
            name:
              user?.fullName ||
              user?.emailAddresses[0]?.emailAddress ||
              "Unknown User",
          },
        },
      },
    });

    revalidatePath("/");
    return { success: true, data: workspace };
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create workspace",
    };
  }
}

export async function getWorkspaces() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get all workspaces where user is a member
    const memberships = await prisma.workspaceMember.findMany({
      where: {
        userId,
      },
      include: {
        workspace: {
          include: {
            pages: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const workspaces = memberships.map((membership) => ({
      ...membership.workspace,
      userRole: membership.role,
    }));

    return { success: true, data: workspaces };
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch workspaces",
    };
  }
}

export async function updateWorkspace(data: { id: string; name: string }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { name, id } = data;

    if (!name || !id) {
      throw new Error("Workspace name and ID are required");
    }

    // Check if user has permission to update workspace (owner or admin)
    const canUpdate = await hasMinimumRole(userId, id, WorkspaceRole.admin);
    if (!canUpdate) {
      throw new Error("You don't have permission to update this workspace");
    }

    const workspace = await prisma.workspace.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    revalidatePath("/");
    revalidatePath(`/workspace/${id}`);
    return { success: true, data: workspace };
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
}
