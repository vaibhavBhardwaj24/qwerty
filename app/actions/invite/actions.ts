"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import redisClient from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function getInviteDetails(inviteId: string) {
  try {
    if (!inviteId) {
      throw new Error("Invite ID is required");
    }
    console.log(inviteId);
    // Retrieve invite from Redis using inviteId
    const inviteData = await redisClient.get(`invite:${inviteId}`);

    if (!inviteData) {
      throw new Error("Invite not found or expired");
    }

    const invite = JSON.parse(inviteData);

    // Get workspace details
    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return {
      success: true,
      data: {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        email: invite.email,
        role: invite.role,
        createdAt: invite.createdAt,
      },
    };
  } catch (error) {
    console.error("Error retrieving invite:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve invite",
    };
  }
}

export async function acceptInvite(inviteId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!inviteId) {
      throw new Error("Invite ID is required");
    }

    // Retrieve invite from Redis using inviteId key
    const inviteData = await redisClient.get(`invite:${inviteId}`);

    if (!inviteData) {
      throw new Error("Invite not found or expired");
    }

    const invite = JSON.parse(inviteData);

    // Verify workspace still exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId,
        },
      },
    });

    if (existingMember) {
      // Clean up invite from Redis
      await redisClient.del(`invite:${inviteId}`);
      await redisClient.del(`invite:${invite.workspaceId}:${invite.email}`);

      throw new Error("You are already a member of this workspace");
    }

    // Create workspace membership
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
        name:
          user?.fullName ||
          user?.emailAddresses[0]?.emailAddress ||
          "Unknown User",
      },
    });

    // Delete both invite keys from Redis
    await redisClient.del(`invite:${inviteId}`);
    await redisClient.del(`invite:${invite.workspaceId}:${invite.email}`);

    revalidatePath("/");
    revalidatePath(`/workspace/${workspace.id}`);

    return {
      success: true,
      data: {
        message: "Successfully joined workspace",
        workspace: {
          id: workspace.id,
          name: workspace.name,
        },
        role: member.role,
      },
    };
  } catch (error) {
    console.error("Error accepting invite:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}
