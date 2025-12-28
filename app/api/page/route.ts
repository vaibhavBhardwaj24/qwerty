import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isWorkspaceMember } from "@/lib/workspace-auth";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, workspaceId, icon, private: isPrivate } = body;

    if (!title || !workspaceId) {
      return NextResponse.json(
        { error: "Page title and workspaceId are required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the workspace
    const isMember = await isWorkspaceMember(userId, workspaceId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        icon,
        workspaceId,
        private: isPrivate ?? false,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        blocks: true,
        workspace: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check if user is a member of the workspace
    const isMember = await isWorkspaceMember(userId, page.workspaceId);

    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have permission to view this page" },
        { status: 403 }
      );
    }

    // If page is private, only workspace members can view it (already checked above)
    // Public pages within workspace are accessible to all workspace members

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch page" },
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

    const body = await request.json();
    const { pageId, title, icon, private: isPrivate } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    // Get page with workspace info
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { workspace: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check workspace membership and role
    const isMember = await isWorkspaceMember(userId, page.workspaceId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have permission to edit this page" },
        { status: 403 }
      );
    }

    // Owner and admin can edit any page
    // Members can edit based on page privacy settings
    // For now, all workspace members can edit pages
    // You can add more granular permissions here if needed

    const updatedPage = await prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        title,
        icon,
        private: isPrivate ?? false,
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}
