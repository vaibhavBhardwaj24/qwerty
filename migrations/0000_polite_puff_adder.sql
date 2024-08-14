CREATE TABLE IF NOT EXISTS "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone,
	"owner" uuid NOT NULL,
	"title" text NOT NULL,
	"iconId" text NOT NULL,
	"data" text,
	"inTrash" text,
	"logo" text,
	"bannerURL" text
);
