"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isWorkspaceMember } from "@/lib/workspace-auth";
import { revalidatePath } from "next/cache";

export async function createBlock(data: {
  content: any;
  pageId: string;
  type: string;
  order: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { content, pageId, type, order } = data;

    if (!content || !pageId || !type || order === undefined) {
      throw new Error("Content, pageId, type, and order are required");
    }

    const block = await prisma.block.create({
      data: {
        content,
        pageId,
        type,
        order,
      },
    });

    revalidatePath(`/page/${pageId}`);
    return { success: true, data: block };
  } catch (error) {
    console.error("Failed to create block:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create block",
    };
  }
}

export async function updateBlock(data: {
  blockId: string;
  content?: any;
  type?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { content, blockId, type } = data;

    if (!blockId) {
      throw new Error("Block ID is required");
    }

    // Get the block with page and workspace info
    const existingBlock = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        page: {
          select: {
            id: true,
            workspaceId: true,
          },
        },
      },
    });

    if (!existingBlock) {
      throw new Error("Block not found");
    }

    // Check if user is a member of the workspace
    const isMember = await isWorkspaceMember(
      userId,
      existingBlock.page.workspaceId
    );

    if (!isMember) {
      throw new Error("You don't have permission to edit this block");
    }

    const block = await prisma.block.update({
      where: {
        id: blockId,
      },
      data: {
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
      },
    });

    revalidatePath(`/page/${existingBlock.page.id}`);
    return { success: true, data: block };
  } catch (error) {
    console.error("Failed to update block:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update block",
    };
  }
}

export async function reorderBlocks(data: {
  blocks: Array<{ id: string; order: number }>;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { blocks } = data;

    if (!blocks || !Array.isArray(blocks)) {
      throw new Error("Blocks array is required");
    }

    // Update each block's order
    await Promise.all(
      blocks.map((block) =>
        prisma.block.update({
          where: { id: block.id },
          data: { order: block.order },
        })
      )
    );

    // Get pageId from first block for revalidation
    if (blocks.length > 0) {
      const firstBlock = await prisma.block.findUnique({
        where: { id: blocks[0].id },
        select: { pageId: true },
      });
      if (firstBlock) {
        revalidatePath(`/page/${firstBlock.pageId}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder blocks:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reorder blocks",
    };
  }
}
