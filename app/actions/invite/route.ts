import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redisClient from "@/lib/redis";

// GET - Retrieve invite details (for displaying invite page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("inviteId");

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invite ID is required" },
        { status: 400 }
      );
    }

    // Retrieve invite from Redis using inviteId
    const inviteData = await redisClient.get(`invite:${inviteId}`);

    if (!inviteData) {
      return NextResponse.json(
        { error: "Invite not found or expired" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      email: invite.email,
      role: invite.role,
      createdAt: invite.createdAt,
    });
  } catch (error) {
    console.error("Error retrieving invite:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invite" },
      { status: 500 }
    );
  }
}

// POST - Accept workspace invitation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inviteId } = body;

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invite ID is required" },
        { status: 400 }
      );
    }

    // Retrieve invite from Redis using inviteId key
    const inviteData = await redisClient.get(`invite:${inviteId}`);

    if (!inviteData) {
      return NextResponse.json(
        { error: "Invite not found or expired" },
        { status: 404 }
      );
    }

    const invite = JSON.parse(inviteData);

    // Verify workspace still exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
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

      return NextResponse.json(
        { error: "You are already a member of this workspace" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Successfully joined workspace",
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      role: member.role,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
