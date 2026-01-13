"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isWorkspaceMember } from "@/lib/workspace-auth";
import { revalidatePath } from "next/cache";

export async function createPage(data: {
  title: string;
  workspaceId: string;
  icon?: string;
  private?: boolean;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { title, workspaceId, icon, private: isPrivate } = data;

    if (!title || !workspaceId) {
      throw new Error("Page title and workspaceId are required");
    }

    // Check if user is a member of the workspace
    const isMember = await isWorkspaceMember(userId, workspaceId);
    if (!isMember) {
      throw new Error("You are not a member of this workspace");
    }

    const page = await prisma.page.create({
      data: {
        title,
        icon,
        workspaceId,
        private: isPrivate ?? false,
      },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true, data: page };
  } catch (error) {
    console.error("Failed to create page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create page",
    };
  }
}

export async function getPage(pageId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!pageId) {
      throw new Error("Page ID is required");
    }

    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      select: {
        workspaceId: true,
        title: true,
        icon: true,
        cover: true,
        private: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    // Check if user is a member of the workspace
    const isMember = await isWorkspaceMember(userId, page.workspaceId);

    if (!isMember) {
      throw new Error("You don't have permission to view this page");
    }

    return { success: true, data: page };
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch page",
    };
  }
}

export async function updatePage(data: {
  pageId: string;
  title?: string;
  icon?: string;
  private?: boolean;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { pageId, title, icon, private: isPrivate } = data;

    if (!pageId) {
      throw new Error("Page ID is required");
    }

    // Get page with workspace info
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { workspace: true },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    // Check workspace membership and role
    const isMember = await isWorkspaceMember(userId, page.workspaceId);
    if (!isMember) {
      throw new Error("You don't have permission to edit this page");
    }

    const updatedPage = await prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(icon !== undefined && { icon }),
        ...(isPrivate !== undefined && { private: isPrivate }),
      },
    });

    revalidatePath(`/workspace/${page.workspaceId}`);
    revalidatePath(`/page/${pageId}`);
    return { success: true, data: updatedPage };
  } catch (error) {
    console.error("Failed to update page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page",
    };
  }
}

export async function favoritePage(data: { pageId: string }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { pageId } = data;

    if (!pageId) {
      throw new Error("Page ID is required");
    }

    // Get page with workspace info
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { workspace: true },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    // Check workspace membership and role
    const isMember = await isWorkspaceMember(userId, page.workspaceId);
    if (!isMember) {
      throw new Error("You don't have permission to favorite this page");
    }

    const updatedPage = await prisma.favorite.create({
      data: {
        pageId,
        userId,
      },
    });

    revalidatePath(`/page/${pageId}`);
    return { success: true, data: updatedPage };
  } catch (error) {
    console.error("Failed to favorite page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to favorite page",
    };
  }
}

export async function unfavoritePage(data: { pageId: string }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { pageId } = data;

    if (!pageId) {
      throw new Error("Page ID is required");
    }

    // Get page with workspace info
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { workspace: true },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    // Check workspace membership and role
    const isMember = await isWorkspaceMember(userId, page.workspaceId);
    if (!isMember) {
      throw new Error("You don't have permission to unfavorite this page");
    }

    await prisma.favorite.delete({
      where: {
        userId_pageId: {
          userId,
          pageId,
        },
      },
    });

    revalidatePath(`/page/${pageId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to unfavorite page:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to unfavorite page",
    };
  }
}
export async function isFavoritePage(data: { pageId: string }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { pageId } = data;

    if (!pageId) {
      throw new Error("Page ID is required");
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_pageId: {
          userId,
          pageId,
        },
      },
    });

    return { success: true, data: favorite !== null };
  } catch (error) {
    console.error("Failed to check favorite page:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check favorite page",
    };
  }
}
export async function getFavoritePages() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const favoritePages = await prisma.favorite.findMany({
      where: {
        userId,
      },
      select: {
        pageId: true,
        page: {
          select: {
            title: true,
            icon: true,
            updatedAt: true,
            workspace: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data: favoritePages };
  } catch (error) {
    console.error("Failed to get favorite pages:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get favorite pages",
    };
  }
}
