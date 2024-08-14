CREATE TABLE IF NOT EXISTS "subTodo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"subTask" text NOT NULL,
	"dueDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	"workspaceId" uuid,
	"todoId" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"isUrgent" boolean DEFAULT false,
	"task" text NOT NULL,
	"dueDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now(),
	"workspaceId" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subTodo" ADD CONSTRAINT "subTodo_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subTodo" ADD CONSTRAINT "subTodo_todoId_todo_id_fk" FOREIGN KEY ("todoId") REFERENCES "public"."todo"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo" ADD CONSTRAINT "todo_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
