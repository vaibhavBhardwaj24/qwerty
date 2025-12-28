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
    const { content, pageId, type, order } = body;

    if (!content || !pageId || !type || !order) {
      return NextResponse.json(
        { error: "Content, pageId, type, and order are required" },
        { status: 400 }
      );
    }

    const block = await prisma.block.create({
      data: {
        content,
        pageId,
        type,
        order,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create block" },
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
    const { content, blockId, type } = body;

    if (!content || !blockId) {
      return NextResponse.json(
        { error: "Content and blockId are required" },
        { status: 400 }
      );
    }

    // Get the block with page and workspace info
    const existingBlock = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        page: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!existingBlock) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    // Check if user is a member of the workspace
    const isMember = await isWorkspaceMember(
      userId,
      existingBlock.page.workspaceId
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have permission to edit this block" },
        { status: 403 }
      );
    }

    const block = await prisma.block.update({
      where: {
        id: blockId,
      },
      data: {
        content,
        type,
      },
    });

    return NextResponse.json(block);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}
