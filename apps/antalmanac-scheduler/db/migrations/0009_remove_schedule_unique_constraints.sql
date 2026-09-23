ALTER TABLE "schedules" DROP CONSTRAINT "schedules_user_id_name_unique";--> statement-breakpoint
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_user_id_index_unique";--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_name_unique" UNIQUE("user_id", "name") DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_index_unique" UNIQUE("user_id", "index") DEFERRABLE INITIALLY DEFERRED;
