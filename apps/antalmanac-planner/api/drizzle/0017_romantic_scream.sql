ALTER TABLE "planner_course" DROP CONSTRAINT "planner_course_planner_id_start_year_quarter_name_planner_quarter_planner_id_start_year_quarter_name_fk";
--> statement-breakpoint
ALTER TABLE "planner_major" DROP CONSTRAINT "planner_major_planner_id_planner_id_fk";
--> statement-breakpoint
ALTER TABLE "planner_minor" DROP CONSTRAINT "planner_minor_planner_id_planner_id_fk";
--> statement-breakpoint
ALTER TABLE "planner_quarter" DROP CONSTRAINT "planner_quarter_planner_id_start_year_planner_year_planner_id_start_year_fk";
--> statement-breakpoint
ALTER TABLE "planner_year" DROP CONSTRAINT "planner_year_planner_id_planner_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_course" ADD CONSTRAINT "planner_course_planner_id_start_year_quarter_name_planner_quarter_planner_id_start_year_quarter_name_fk" FOREIGN KEY ("planner_id","start_year","quarter_name") REFERENCES "public"."planner_quarter"("planner_id","start_year","quarter_name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_major" ADD CONSTRAINT "planner_major_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_minor" ADD CONSTRAINT "planner_minor_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_quarter" ADD CONSTRAINT "planner_quarter_planner_id_start_year_planner_year_planner_id_start_year_fk" FOREIGN KEY ("planner_id","start_year") REFERENCES "public"."planner_year"("planner_id","start_year") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_year" ADD CONSTRAINT "planner_year_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
