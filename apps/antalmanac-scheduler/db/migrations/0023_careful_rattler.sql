ALTER TABLE "users" ADD COLUMN "majors" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "major";