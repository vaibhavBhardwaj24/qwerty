"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole, WorkspaceRoleType } from "@/app/types/roles";
import { hasMinimumRole, getWorkspaceRole } from "@/lib/workspace-auth";
import { randomUUID } from "crypto";
import redisClient from "@/lib/redis";
import { sendWorkspaceInvite } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function inviteMember(data: {
  workspaceId: string;
  inviteUserEmail: string;
  role: WorkspaceRoleType;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { workspaceId, inviteUserEmail, role } = data;

    // Validate required fields first
    if (!workspaceId || !inviteUserEmail || !role) {
      throw new Error("Workspace ID, email, and role are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteUserEmail)) {
      throw new Error("Invalid email address");
    }

    // Validate role
    if (!Object.values(WorkspaceRole).includes(role)) {
      throw new Error("Invalid role. Must be owner, admin, or member");
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Check if requesting user has permission to invite (owner or admin)
    const canInvite = await hasMinimumRole(
      userId,
      workspaceId,
      WorkspaceRole.admin
    );
    if (!canInvite) {
      throw new Error("You don't have permission to invite members");
    }

    // Get inviter details for email
    const ClerkClient = await clerkClient();
    const user = await currentUser();

    // Check if user already exists in Clerk
    const existingUsers = await ClerkClient.users.getUserList({
      emailAddress: [inviteUserEmail],
    });
    const inviteUser = existingUsers.data[0];

    // If user exists in Clerk, check if already a workspace member
    if (inviteUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: inviteUser.id,
          },
        },
      });

      if (existingMember) {
        throw new Error("User is already a member of this workspace");
      }
    }

    // Check if there's already a pending invite for this email
    const existingInvites = await redisClient.keys(
      `invite:${workspaceId}:${inviteUserEmail}`
    );
    if (existingInvites.length > 0) {
      throw new Error("An invitation has already been sent to this email");
    }

    // Create invite
    const inviteId = randomUUID();
    const invite = {
      workspaceId,
      email: inviteUserEmail,
      role,
      invitedBy: userId,
      createdAt: new Date().toISOString(),
    };

    // Store invite in Redis with 7 day expiration
    await redisClient.set(
      `invite:${workspaceId}:${inviteUserEmail}`,
      JSON.stringify(invite),
      { EX: 60 * 60 * 24 * 7 }
    );

    // Also store by inviteId for easy lookup
    await redisClient.set(`invite:${inviteId}`, JSON.stringify(invite), {
      EX: 60 * 60 * 24 * 7,
    });

    // Get base URL from environment or use localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/invite?inviteId=${inviteId}`;

    // Send invitation email
    await sendWorkspaceInvite({
      to: inviteUserEmail,
      workspaceName: workspace.name,
      inviterName:
        user?.fullName || user?.emailAddresses[0]?.emailAddress || "Someone",
      inviteLink,
      role,
    });

    return {
      success: true,
      data: {
        message: "Invitation sent successfully",
        inviteId,
      },
    };
  } catch (error) {
    console.error("Error inviting member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite member",
    };
  }
}

export async function removeMember(data: {
  workspaceId: string;
  removeUserId: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { workspaceId, removeUserId } = data;

    if (!workspaceId || !removeUserId) {
      throw new Error("Workspace ID and user ID are required");
    }

    // Only owner can remove members
    const userRole = await getWorkspaceRole(userId, workspaceId);
    if (userRole !== WorkspaceRole.owner) {
      throw new Error("Only workspace owner can remove members");
    }

    // Cannot remove the workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === removeUserId) {
      throw new Error("Cannot remove workspace owner");
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: removeUserId,
        },
      },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

export async function updateMemberRole(data: {
  workspaceId: string;
  targetUserId: string;
  role: WorkspaceRoleType;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { workspaceId, targetUserId, role } = data;

    if (!workspaceId || !targetUserId || !role) {
      throw new Error("Workspace ID, user ID, and role are required");
    }

    // Validate role
    if (!Object.values(WorkspaceRole).includes(role)) {
      throw new Error("Invalid role. Must be owner, admin, or member");
    }

    // Only owner can change roles
    const userRole = await getWorkspaceRole(userId, workspaceId);
    if (userRole !== WorkspaceRole.owner) {
      throw new Error("Only workspace owner can change member roles");
    }

    // Cannot change owner's role
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === targetUserId) {
      throw new Error("Cannot change workspace owner's role");
    }

    const member = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUserId,
        },
      },
      data: {
        role,
      },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error("Error updating member role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}
