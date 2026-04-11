ALTER TABLE "users" RENAME COLUMN "updated_at" TO "last_updated";--> statement-breakpoint
ALTER TABLE "schedules" RENAME COLUMN "updated_at" TO "last_updated";--> statement-breakpoint
ALTER TABLE "coursesInSchedule" RENAME COLUMN "updated_at" TO "last_updated";--> statement-breakpoint
ALTER TABLE "customEvents" RENAME COLUMN "updated_at" TO "last_updated";