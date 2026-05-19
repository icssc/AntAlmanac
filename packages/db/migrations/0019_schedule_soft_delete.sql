ALTER TABLE "schedules" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "index" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_archive_index_consistency" CHECK (
  ("archived_at" IS NULL AND "index" IS NOT NULL)
  OR ("archived_at" IS NOT NULL AND "index" IS NULL)
);
