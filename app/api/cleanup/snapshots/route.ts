import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface CleanupResponse {
  success: boolean;
  deletedCount: number;
  preservedCount: number;
  cutoffDate: string;
  error?: string;
}

export async function POST() {
  try {
    // Calculate cutoff date (10 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 10);

    // Get all pages with snapshots
    const pagesWithSnapshots = await prisma.yjsSnapshot.groupBy({
      by: ["pageId"],
      _count: {
        id: true,
      },
    });

    let deletedCount = 0;
    let preservedCount = 0;

    // Process each page
    for (const page of pagesWithSnapshots) {
      // Get the latest snapshot for this page
      const latestSnapshot = await prisma.yjsSnapshot.findFirst({
        where: { pageId: page.pageId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (!latestSnapshot) continue;

      // Delete old snapshots, excluding the latest one
      const result = await prisma.yjsSnapshot.deleteMany({
        where: {
          pageId: page.pageId,
          createdAt: {
            lt: cutoffDate,
          },
          id: {
            not: latestSnapshot.id,
          },
        },
      });

      deletedCount += result.count;

      // Count preserved snapshots (newer than cutoff or is the latest)
      const preserved = await prisma.yjsSnapshot.count({
        where: {
          pageId: page.pageId,
          OR: [
            {
              createdAt: {
                gte: cutoffDate,
              },
            },
            {
              id: latestSnapshot.id,
            },
          ],
        },
      });

      preservedCount += preserved;
    }

    const response: CleanupResponse = {
      success: true,
      deletedCount,
      preservedCount,
      cutoffDate: cutoffDate.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Snapshot cleanup failed:", error);

    const response: CleanupResponse = {
      success: false,
      deletedCount: 0,
      preservedCount: 0,
      cutoffDate: new Date().toISOString(),
      error: error.message || "Cleanup failed",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
