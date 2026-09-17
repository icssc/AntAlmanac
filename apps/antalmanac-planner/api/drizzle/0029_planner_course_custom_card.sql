ALTER TABLE "planner_course" ADD COLUMN IF NOT EXISTS "custom_card_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_course" ADD CONSTRAINT "planner_course_custom_card_id_custom_card_id_fk" FOREIGN KEY ("custom_card_id") REFERENCES "public"."custom_card"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_course" ADD CONSTRAINT "planner_course_custom_card_id_check" CHECK (("planner_course"."custom_card_id" IS NOT NULL) = ("planner_course"."course_id" = 'CUSTOM'));
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
