import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { todo } from "../../../../migrations/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      console.log("No ID provided");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    const result = await db
      .select({
        todoId: todo.id,
        todoCompleted: todo.isCompleted,
        todoUrgent: todo.isUrgent,
        todoTask: todo.task,
        todoDueDate: todo.dueDate,
      })
      .from(todo)
      .where(eq(todo.workspaceId, workspaceId));
    console.log(result);

    return NextResponse.json({
      success: true,
      todo: result,
    });
  } catch (error) {
    console.error("Error fetching workspace data:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
