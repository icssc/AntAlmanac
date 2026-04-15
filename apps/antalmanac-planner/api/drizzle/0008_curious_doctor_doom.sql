CREATE TABLE IF NOT EXISTS "transferred_ap_exam" (
	"user_id" integer NOT NULL,
	"exam_name" text NOT NULL,
	"score" integer,
	CONSTRAINT "transferred_ap_exam_user_id_exam_name_pk" PRIMARY KEY("user_id","exam_name"),
	CONSTRAINT "score_in_range" CHECK ("transferred_ap_exam"."score" IS NULL OR ("transferred_ap_exam"."score" >= 1 AND "transferred_ap_exam"."score" <= 5))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transferred_course" (
	"user_id" integer NOT NULL,
	"course_name" text NOT NULL,
	"units" real DEFAULT 0 NOT NULL,
	CONSTRAINT "transferred_course_user_id_course_name_pk" PRIMARY KEY("user_id","course_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transferred_ge" (
	"user_id" integer NOT NULL,
	"ge_name" text NOT NULL,
	"number_of_courses" integer NOT NULL,
	"units" real NOT NULL,
	CONSTRAINT "transferred_ge_user_id_ge_name_pk" PRIMARY KEY("user_id","ge_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transferred_ap_exam" ADD CONSTRAINT "transferred_ap_exam_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transferred_course" ADD CONSTRAINT "transferred_course_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transferred_ge" ADD CONSTRAINT "transferred_ge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
