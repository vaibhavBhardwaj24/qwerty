"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get workspace members for mention autocomplete
 */
export async function getWorkspaceMembers(workspaceId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: members };
  } catch (error) {
    console.error("Failed to fetch workspace members:", error);
    return {
      success: false,
      error: "Failed to fetch workspace members",
    };
  }
}
export async function getWorkspaceMembersByPageId(pageId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });
    if (!page) {
      return { success: false, error: "Page not found" };
    }
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: page.workspaceId,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: members };
  } catch (error) {
    console.error("Failed to fetch workspace members:", error);
    return {
      success: false,
      error: "Failed to fetch workspace members",
    };
  }
}
/**
 * Create a mention and send notification
 */
export async function createMention(data: {
  userId: string; // Who is being mentioned
  pageId: string;
  // workspaceId: string;
}) {
  try {
    const { userId: mentionedBy } = await auth();
    if (!mentionedBy) {
      return { success: false, error: "Unauthorized" };
    }

    // Don't create mention if user mentions themselves
    if (data.userId === mentionedBy) {
      return { success: true, data: null };
    }

    const pageCheck = await prisma.page.findUnique({
      where: { id: data.pageId },
      select: { workspaceId: true },
    });
    if (!pageCheck) {
      return { success: false, error: "Page not found" };
    }
    // Create mention
    const mention = await prisma.mentions.create({
      data: {
        userId: data.userId,
        pageId: data.pageId,
        workspaceId: pageCheck.workspaceId,
        mentionedBy,
      },
    });

    // Get page title for notification
    const page = await prisma.page.findUnique({
      where: { id: data.pageId },
      select: { title: true },
    });

    // Get mentioner name
    const mentioner = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: pageCheck.workspaceId,
        userId: mentionedBy,
      },
      select: { name: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: data.userId,
        workspaceId: pageCheck.workspaceId,
        type: "mention",
        message: `${mentioner?.name || "Someone"} mentioned you in "${
          page?.title || "a page"
        }"`,
      },
    });

    revalidatePath(`/page/${data.pageId}`);
    return { success: true, data: mention };
  } catch (error) {
    console.error("Failed to create mention:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create mention",
    };
  }
}

/**
 * Get mentions for a user
 */
export async function getMentions(userId: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: "Unauthorized" };
    }

    const mentions = await prisma.mentions.findMany({
      where: {
        userId,
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: mentions };
  } catch (error) {
    console.error("Failed to fetch mentions:", error);
    return {
      success: false,
      error: "Failed to fetch mentions",
    };
  }
}

/**
 * Get all mentions on a page
 */
export async function getPageMentions(pageId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const mentions = await prisma.mentions.findMany({
      where: {
        pageId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: mentions };
  } catch (error) {
    console.error("Failed to fetch page mentions:", error);
    return {
      success: false,
      error: "Failed to fetch page mentions",
    };
  }
}

/**
 * Delete a mention by ID
 */
export async function deleteMention(mentionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete the mention
    await prisma.mentions.delete({
      where: {
        id: mentionId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete mention:", error);
    return {
      success: false,
      error: "Failed to delete mention",
    };
  }
}

/**
 * Get all mentions in a workspace
 */
export async function getWorkspaceMentions(workspaceId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const mentions = await prisma.mentions.findMany({
      where: {
        workspaceId,
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user names for mentioned users and mentioners
    const mentionsWithNames = await Promise.all(
      mentions.map(async (mention) => {
        const mentionedUser = await prisma.workspaceMember.findFirst({
          where: {
            workspaceId,
            userId: mention.userId,
          },
          select: {
            name: true,
          },
        });

        const mentioner = await prisma.workspaceMember.findFirst({
          where: {
            workspaceId,
            userId: mention.mentionedBy,
          },
          select: {
            name: true,
          },
        });

        return {
          ...mention,
          mentionedUserName: mentionedUser?.name || "Unknown User",
          mentionerName: mentioner?.name || "Unknown User",
        };
      })
    );

    return { success: true, data: mentionsWithNames };
  } catch (error) {
    console.error("Failed to fetch workspace mentions:", error);
    return {
      success: false,
      error: "Failed to fetch workspace mentions",
    };
  }
}
