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

    // Generate unique slug from workspace name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Add random suffix for uniqueness (6 characters)
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
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
      pages: membership.workspace.pages.map((page) => ({
        id: page.id,
        name: page.title, // Map title to name for component compatibility
        icon: page.icon,
      })),
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

export async function getWorkspaceById(workspaceId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if user is a member of this workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
      include: {
        workspace: {
          include: {
            pages: {
              orderBy: {
                createdAt: "desc",
              },
            },
            members: true,
          },
        },
      },
    });

    if (!membership) {
      throw new Error("Workspace not found or access denied");
    }

    const workspace = {
      ...membership.workspace,
      userRole: membership.role,
      pages: membership.workspace.pages.map((page) => ({
        id: page.id,
        name: page.title,
        icon: page.icon,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      })),
    };

    return { success: true, data: workspace };
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch workspace",
    };
  }
}

export async function updateWorkspace(data: {
  id: string;
  name: string;
  icon?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { name, icon, id } = data;

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
        icon,
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
