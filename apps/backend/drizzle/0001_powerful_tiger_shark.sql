ALTER TABLE "schedules" ADD COLUMN "index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_index_unique" UNIQUE("user_id","index");