ALTER TABLE "users" DROP CONSTRAINT "users_current_schedule_id_schedules_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_current_schedule_id_schedules_id_fk" FOREIGN KEY ("current_schedule_id") REFERENCES "public"."schedules"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
