"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isWorkspaceMember } from "@/lib/workspace-auth";
import {
  deserializeYjsSnapshot,
  yjsDocToText,
  diffYjsSnapshots,
  createYjsSnapshot,
} from "@/lib/yjs-utils";
import { revalidatePath } from "next/cache";
import * as Y from "yjs";

export interface VersionMetadata {
  id: string;
  version: number;
  createdAt: Date;
  createdBy: string;
  preview: string; // First 200 characters of text
}

export interface VersionDetail extends VersionMetadata {
  textContent: string; // Full text content
  snapshotData: string; // Base64 encoded snapshot for client-side rendering
}

/**
 * Get all versions for a page
 */
export async function getPageVersions(pageId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get page and verify access
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { workspaceId: true },
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    // Check workspace membership
    const isMember = await isWorkspaceMember(userId, page.workspaceId);
    if (!isMember) {
      return { success: false, error: "Access denied" };
    }

    // Fetch all snapshots for this page
    const snapshots = await prisma.yjsSnapshot.findMany({
      where: { pageId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        version: true,
        createdAt: true,
        createdBy: true,
        snapshot: true,
      },
    });

    // Convert snapshots to metadata with previews
    const versions: VersionMetadata[] = snapshots.map((snapshot) => {
      try {
        // Convert Uint8Array to Buffer for deserialization
        const buffer = Buffer.from(snapshot.snapshot);
        const ydoc = deserializeYjsSnapshot(buffer);
        const text = yjsDocToText(ydoc);
        const preview =
          text.substring(0, 200) + (text.length > 200 ? "..." : "");

        return {
          id: snapshot.id,
          version: snapshot.version,
          createdAt: snapshot.createdAt,
          createdBy: snapshot.createdBy,
          preview,
        };
      } catch (error) {
        console.error(`Failed to deserialize snapshot ${snapshot.id}:`, error);
        return {
          id: snapshot.id,
          version: snapshot.version,
          createdAt: snapshot.createdAt,
          createdBy: snapshot.createdBy,
          preview: "[Unable to load preview]",
        };
      }
    });

    return { success: true, data: versions };
  } catch (error) {
    console.error("Failed to get page versions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get versions",
    };
  }
}

/**
 * Get detailed content for a specific version
 */
export async function getVersionContent(snapshotId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get snapshot with page info
    const snapshot = await prisma.yjsSnapshot.findUnique({
      where: { id: snapshotId },
      include: {
        page: {
          select: { workspaceId: true },
        },
      },
    });

    if (!snapshot) {
      return { success: false, error: "Version not found" };
    }

    // Check workspace membership
    const isMember = await isWorkspaceMember(userId, snapshot.page.workspaceId);
    if (!isMember) {
      return { success: false, error: "Access denied" };
    }

    // Deserialize and extract text
    const buffer = Buffer.from(snapshot.snapshot);
    const ydoc = deserializeYjsSnapshot(buffer);
    const textContent = yjsDocToText(ydoc);
    const preview =
      textContent.substring(0, 200) + (textContent.length > 200 ? "..." : "");

    // Convert snapshot to base64 for client-side rendering
    const snapshotData = Buffer.from(snapshot.snapshot).toString("base64");

    const versionDetail: VersionDetail = {
      id: snapshot.id,
      version: snapshot.version,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy,
      preview,
      textContent,
      snapshotData,
    };

    return { success: true, data: versionDetail };
  } catch (error) {
    console.error("Failed to get version content:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get version content",
    };
  }
}

/**
 * Restore a page to a specific version
 */
export async function restoreVersion(pageId: string, snapshotId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get page and verify access
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { workspaceId: true },
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    // Check workspace membership and edit permissions
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: page.workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      return { success: false, error: "Access denied" };
    }

    if (member.role === "viewer") {
      return {
        success: false,
        error: "You don't have permission to restore versions",
      };
    }

    // Get the snapshot to restore
    const snapshot = await prisma.yjsSnapshot.findUnique({
      where: { id: snapshotId },
    });

    if (!snapshot || snapshot.pageId !== pageId) {
      return { success: false, error: "Version not found" };
    }

    // The actual restoration happens on the client side by applying the snapshot to the Y.Doc
    // We just need to return the snapshot data
    return {
      success: true,
      data: {
        snapshotId: snapshot.id,
        snapshot: Buffer.from(snapshot.snapshot).toString("base64"),
      },
    };
  } catch (error) {
    console.error("Failed to restore version:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to restore version",
    };
  }
}

/**
 * Compare two versions and return diff statistics
 */
export async function compareVersions(
  snapshotId1: string,
  snapshotId2: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get both snapshots
    const [snapshot1, snapshot2] = await Promise.all([
      prisma.yjsSnapshot.findUnique({
        where: { id: snapshotId1 },
        include: { page: { select: { workspaceId: true } } },
      }),
      prisma.yjsSnapshot.findUnique({
        where: { id: snapshotId2 },
        include: { page: { select: { workspaceId: true } } },
      }),
    ]);

    if (!snapshot1 || !snapshot2) {
      return { success: false, error: "One or both versions not found" };
    }

    // Verify both belong to same page
    if (snapshot1.pageId !== snapshot2.pageId) {
      return { success: false, error: "Versions belong to different pages" };
    }

    // Check workspace membership
    const isMember = await isWorkspaceMember(
      userId,
      snapshot1.page.workspaceId
    );
    if (!isMember) {
      return { success: false, error: "Access denied" };
    }

    // Calculate diff
    const buffer1 = Buffer.from(snapshot1.snapshot);
    const buffer2 = Buffer.from(snapshot2.snapshot);
    const diff = diffYjsSnapshots(buffer1, buffer2);

    return {
      success: true,
      data: {
        ...diff,
        version1: snapshot1.version,
        version2: snapshot2.version,
        createdAt1: snapshot1.createdAt,
        createdAt2: snapshot2.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to compare versions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to compare versions",
    };
  }
}

/**
 * Delete old versions (cleanup utility)
 */
export async function deleteOldVersions(
  pageId: string,
  keepCount: number = 50
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get page and verify access
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { workspaceId: true },
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    // Check if user is workspace owner or admin
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: page.workspaceId,
          userId,
        },
      },
    });

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return {
        success: false,
        error: "Only workspace owners/admins can delete versions",
      };
    }

    // Get all snapshots, sorted by creation date
    const snapshots = await prisma.yjsSnapshot.findMany({
      where: { pageId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    // Keep the most recent ones, delete the rest
    if (snapshots.length > keepCount) {
      const toDelete = snapshots.slice(keepCount).map((s) => s.id);

      await prisma.yjsSnapshot.deleteMany({
        where: {
          id: { in: toDelete },
        },
      });

      return {
        success: true,
        data: { deleted: toDelete.length },
      };
    }

    return { success: true, data: { deleted: 0 } };
  } catch (error) {
    console.error("Failed to delete old versions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete old versions",
    };
  }
}
