import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Workspace } from "@/app/types/workspace";
import { WorkspaceRole } from "@/app/types/roles";
import { hasMinimumRole } from "@/lib/workspace-auth";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.owner,
          },
        },
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Workspace = await request.json();
    const { name, id } = body;

    if (!name || !id) {
      return NextResponse.json(
        { error: "Workspace name and ID are required" },
        { status: 400 }
      );
    }

    // Check if user has permission to update workspace (owner or admin)
    const canUpdate = await hasMinimumRole(userId, id, WorkspaceRole.admin);
    if (!canUpdate) {
      return NextResponse.json(
        { error: "You don't have permission to update this workspace" },
        { status: 403 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}
