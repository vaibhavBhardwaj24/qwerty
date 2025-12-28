import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole } from "@/app/types/roles";
import { hasMinimumRole, getWorkspaceRole } from "@/lib/workspace-auth";
import { randomUUID } from "crypto";
import redisClient from "@/lib/redis";
import { sendWorkspaceInvite } from "@/lib/email";

// POST - Invite member to workspace
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, inviteUserEmail, role } = body;

    // Validate required fields first
    if (!workspaceId || !inviteUserEmail || !role) {
      return NextResponse.json(
        { error: "Workspace ID, email, and role are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteUserEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(WorkspaceRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be owner, admin, or member" },
        { status: 400 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if requesting user has permission to invite (owner or admin)
    const canInvite = await hasMinimumRole(
      userId,
      workspaceId,
      WorkspaceRole.admin
    );
    if (!canInvite) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      );
    }

    // Get inviter details for email
    const ClerkClient = await clerkClient();
    const user = await ClerkClient.users.getUser(userId);

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
        return NextResponse.json(
          { error: "User is already a member of this workspace" },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invite for this email
    const existingInvites = await redisClient.keys(
      `invite:${workspaceId}:${inviteUserEmail}`
    );
    if (existingInvites.length > 0) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
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
        user.firstName || user.emailAddresses[0]?.emailAddress || "Someone",
      inviteLink,
      role,
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      inviteId,
    });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove member from workspace
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const removeUserId = searchParams.get("userId");

    if (!workspaceId || !removeUserId) {
      return NextResponse.json(
        { error: "Workspace ID and user ID are required" },
        { status: 400 }
      );
    }

    // Only owner can remove members
    const userRole = await getWorkspaceRole(userId, workspaceId);
    if (userRole !== WorkspaceRole.owner) {
      return NextResponse.json(
        { error: "Only workspace owner can remove members" },
        { status: 403 }
      );
    }

    // Cannot remove the workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === removeUserId) {
      return NextResponse.json(
        { error: "Cannot remove workspace owner" },
        { status: 400 }
      );
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: removeUserId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// PATCH - Update member role
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, targetUserId, role } = body;

    if (!workspaceId || !targetUserId || !role) {
      return NextResponse.json(
        { error: "Workspace ID, user ID, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(WorkspaceRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be owner, admin, or member" },
        { status: 400 }
      );
    }

    // Only owner can change roles
    const userRole = await getWorkspaceRole(userId, workspaceId);
    if (userRole !== WorkspaceRole.owner) {
      return NextResponse.json(
        { error: "Only workspace owner can change member roles" },
        { status: 403 }
      );
    }

    // Cannot change owner's role
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot change workspace owner's role" },
        { status: 400 }
      );
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

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}
