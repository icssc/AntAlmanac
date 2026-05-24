ALTER TABLE "schedules" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_user_id_index_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "schedules_user_id_index_active_unique" ON "schedules" USING btree ("user_id", "index") WHERE "archived_at" IS NULL;
