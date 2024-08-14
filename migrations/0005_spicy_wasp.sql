ALTER TABLE "collaborators" ALTER COLUMN "workspaceId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collaborators" ALTER COLUMN "collabId" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "composite_key" ON "collaborators" USING btree ("workspaceId","collabId");