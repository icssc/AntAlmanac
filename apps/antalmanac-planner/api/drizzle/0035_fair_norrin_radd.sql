ALTER TABLE "user" DROP CONSTRAINT "unique_google_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "google_id";