import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { files } from "../../../../migrations/schema";
import { folders } from "@/lib/supabase/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function POST(req: NextRequest, res: NextResponse) {
  const { folderId } = await req.json();
  try {
    const result = await db
      .select({
        folderId: folders.id,
        folderTitle: folders.title,
        folderOwner: folders.owner,
        folderIcon: folders.iconId,
        folderDesc: folders.data,
        folderBanner: folders.bannerURL,
        folderWorkSpaceId: folders.workspaceId,
        // filesTitle: files.title,
        // filesIcon: files.iconId,
        // filesOwner: files.owner,
        // filesId: files.id,
        // fileTrash: files.inTrash,
      })
      .from(folders)
      // .leftJoin(
      //   files,
      //   and(eq(files.folderId, folders.id), isNull(files.inTrash))
      // )
      .where(eq(folders.id, folderId));
    const folderMap = new Map();

    result.forEach((row) => {
      const {
        folderId,
        folderTitle,
        folderOwner,
        folderIcon,
        folderDesc,
        folderBanner,
        folderWorkSpaceId,
        // filesId,
        // filesTitle,
        // filesIcon,
        // filesOwner,
        // fileTrash,
      } = row;

      if (!folderMap.has(folderId)) {
        folderMap.set(folderId, {
          folderId,
          folderWorkSpaceId,
          folderTitle,
          folderOwner,
          folderIcon,
          folderDesc,
          folderBanner,
          // files: [],
        });
      }
      const folderEntry = folderMap.get(folderId);
      // if (folderId) {
      //   folderEntry.folderDetail.push({

      //   });
      // }
      // if (filesId) {
      //   folderEntry.files.push({
      //     filesTitle,
      //     filesIcon,
      //     filesOwner,
      //     filesId,
      //     fileTrash,
      //   });
      // }
    });

    const aggregatedResult = Array.from(folderMap.values());
    console.log(aggregatedResult);
    return NextResponse.json({
      success: true,
      folders: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
