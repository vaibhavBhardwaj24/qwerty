import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { files, users } from "../../../../migrations/schema";
import { eq } from "drizzle-orm";
import { NextApiResponse } from "next";
// interface SocketServer extends HttpServer {
//   io?: Server;
// }

// interface SocketWithIO extends NetSocket {
//   server: SocketServer;
// }

export async function POST(req: NextRequest, res: NextResponse) {
  const { fileId } = await req.json();
  try {
    const result = await db
      .select({
        fileTitle: files.title,
        fileIcon: files.iconId,
        fileData: files.data,
        fileBanner: files.bannerURL,
        fileWorkSpaceId: files.workspaceId,
        fileCreatedAt: files.createdAt,
        // fileOwner: users.email,
        // fileOwnerName: users.full_name,
        // fileOwnerId: files.owner,
      })
      .from(files)
      // .leftJoin(users, eq(files.owner, users.id))
      .where(eq(files.id, fileId));
    console.log(result);

    return NextResponse.json({
      success: true,
      file: result,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
