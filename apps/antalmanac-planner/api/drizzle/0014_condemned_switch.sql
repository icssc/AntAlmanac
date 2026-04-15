CREATE TABLE IF NOT EXISTS "planner_course" (
	"planner_id" integer NOT NULL,
	"start_year" integer NOT NULL,
	"quarter_name" text NOT NULL,
	"course_id" text NOT NULL,
	"index" integer NOT NULL,
	"units" real,
	CONSTRAINT "planner_course_planner_id_start_year_quarter_name_course_id_pk" PRIMARY KEY("planner_id","start_year","quarter_name","course_id"),
	CONSTRAINT "planner_course_unique_index" UNIQUE("planner_id","start_year","quarter_name","index")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "planner_quarter" (
	"planner_id" integer NOT NULL,
	"start_year" integer NOT NULL,
	"quarter_name" text NOT NULL,
	CONSTRAINT "planner_quarter_planner_id_start_year_quarter_name_pk" PRIMARY KEY("planner_id","start_year","quarter_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "planner_year" (
	"planner_id" integer NOT NULL,
	"start_year" integer NOT NULL,
	"year" text NOT NULL,
	CONSTRAINT "planner_year_planner_id_start_year_pk" PRIMARY KEY("planner_id","start_year")
);
--> statement-breakpoint
ALTER TABLE "planner" ADD COLUMN "share_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_course" ADD CONSTRAINT "planner_course_planner_id_start_year_quarter_name_planner_quarter_planner_id_start_year_quarter_name_fk" FOREIGN KEY ("planner_id","start_year","quarter_name") REFERENCES "public"."planner_quarter"("planner_id","start_year","quarter_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_quarter" ADD CONSTRAINT "planner_quarter_planner_id_start_year_planner_year_planner_id_start_year_fk" FOREIGN KEY ("planner_id","start_year") REFERENCES "public"."planner_year"("planner_id","start_year") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_year" ADD CONSTRAINT "planner_year_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
