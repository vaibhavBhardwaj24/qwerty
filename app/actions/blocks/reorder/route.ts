import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { blocks } = body; // Array of { id, order }

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: "Blocks array is required" },
        { status: 400 }
      );
    }

    // Update each block's order
    await Promise.all(
      blocks.map((block: { id: string; order: number }) =>
        prisma.block.update({
          where: { id: block.id },
          data: { order: block.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reorder blocks" },
      { status: 500 }
    );
  }
}
