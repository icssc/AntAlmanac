ALTER TABLE "coursesInSchedule" ADD COLUMN IF NOT EXISTS "visibility" text DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE "coursesInSchedule" ADD CONSTRAINT "visibility_check" CHECK ("visibility" IN ('visible', 'outlined', 'disappeared'));
