CREATE TYPE "public"."provider" AS ENUM('GOOGLE', 'APPLE');--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" integer NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_user_id_provider_pk" PRIMARY KEY("user_id","provider"),
	CONSTRAINT "unique_provider_account_id" UNIQUE("provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "completed_marker_requirement" (
	"user_id" integer NOT NULL,
	"marker_name" text NOT NULL,
	CONSTRAINT "completed_marker_requirement_user_id_marker_name_pk" PRIMARY KEY("user_id","marker_name")
);
--> statement-breakpoint
CREATE TABLE "course_notes" (
	"user_id" integer,
	"course_id" text NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_notes_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "custom_card" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "custom_card_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"units" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "override" (
	"user_id" integer NOT NULL,
	"planner_id" integer NOT NULL,
	"requirement" text NOT NULL,
	CONSTRAINT "override_user_id_planner_id_requirement_pk" PRIMARY KEY("user_id","planner_id","requirement")
);
--> statement-breakpoint
CREATE TABLE "planner" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "planner_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"share_id" text,
	"chc" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_planner_user_id_name" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "planner_course" (
	"planner_id" integer NOT NULL,
	"start_year" integer NOT NULL,
	"quarter_name" text NOT NULL,
	"index" integer NOT NULL,
	"course_id" text NOT NULL,
	"custom_card_id" integer,
	"units" real,
	CONSTRAINT "planner_course_planner_id_start_year_quarter_name_index_pk" PRIMARY KEY("planner_id","start_year","quarter_name","index"),
	CONSTRAINT "planner_course_custom_card_id_check" CHECK (("planner_course"."custom_card_id" IS NOT NULL) = ("planner_course"."course_id" = 'CUSTOM'))
);
--> statement-breakpoint
CREATE TABLE "planner_major" (
	"id" serial PRIMARY KEY NOT NULL,
	"planner_id" integer NOT NULL,
	"major_id" text NOT NULL,
	"specialization_id" text
);
--> statement-breakpoint
CREATE TABLE "planner_minor" (
	"id" serial PRIMARY KEY NOT NULL,
	"planner_id" integer NOT NULL,
	"minor_id" text
);
--> statement-breakpoint
CREATE TABLE "planner_quarter" (
	"planner_id" integer NOT NULL,
	"start_year" integer NOT NULL,
	"quarter_name" text NOT NULL,
	CONSTRAINT "planner_quarter_planner_id_start_year_quarter_name_pk" PRIMARY KEY("planner_id","start_year","quarter_name")
);
--> statement-breakpoint
CREATE TABLE "planner_year" (
	"planner_id" integer NOT NULL,
	"start_year" integer NOT NULL,
	"name" text NOT NULL,
	"collapsed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "planner_year_planner_id_start_year_pk" PRIMARY KEY("planner_id","start_year")
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"review_id" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"professor_id" text NOT NULL,
	"course_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"anonymous" boolean NOT NULL,
	"content" text,
	"rating" integer NOT NULL,
	"difficulty" integer NOT NULL,
	"grade_received" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"for_credit" boolean NOT NULL,
	"quarter" text NOT NULL,
	"take_again" boolean,
	"textbook" boolean,
	"attendance" boolean,
	"tags" text[],
	"verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "unique_review" UNIQUE("user_id","professor_id","course_id"),
	CONSTRAINT "rating_check" CHECK ("review"."rating" >= 1 AND "review"."rating" <= 5),
	CONSTRAINT "difficulty_check" CHECK ("review"."difficulty" >= 1 AND "review"."difficulty" <= 5)
);
--> statement-breakpoint
CREATE TABLE "saved_course" (
	"user_id" integer NOT NULL,
	"course_id" text NOT NULL,
	CONSTRAINT "saved_course_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "transferred_ap_exam_reward_selection" (
	"user_id" integer NOT NULL,
	"exam_name" text NOT NULL,
	"path" text NOT NULL,
	"selected_index" integer NOT NULL,
	CONSTRAINT "transferred_ap_exam_reward_selection_user_id_exam_name_path_pk" PRIMARY KEY("user_id","exam_name","path")
);
--> statement-breakpoint
CREATE TABLE "transferred_ap_exam" (
	"user_id" integer NOT NULL,
	"exam_name" text NOT NULL,
	"score" integer,
	"units" real NOT NULL,
	CONSTRAINT "transferred_ap_exam_user_id_exam_name_pk" PRIMARY KEY("user_id","exam_name"),
	CONSTRAINT "score_in_range" CHECK ("transferred_ap_exam"."score" IS NULL OR ("transferred_ap_exam"."score" >= 1 AND "transferred_ap_exam"."score" <= 5))
);
--> statement-breakpoint
CREATE TABLE "transferred_course" (
	"user_id" integer NOT NULL,
	"course_name" text NOT NULL,
	"units" real DEFAULT 0 NOT NULL,
	CONSTRAINT "transferred_course_user_id_course_name_pk" PRIMARY KEY("user_id","course_name")
);
--> statement-breakpoint
CREATE TABLE "transferred_ge" (
	"user_id" integer NOT NULL,
	"ge_name" text NOT NULL,
	"number_of_courses" integer NOT NULL,
	"units" real NOT NULL,
	CONSTRAINT "transferred_ge_user_id_ge_name_pk" PRIMARY KEY("user_id","ge_name")
);
--> statement-breakpoint
CREATE TABLE "transferred_misc" (
	"user_id" integer,
	"course_name" text,
	"units" real,
	CONSTRAINT "transferred_misc_user_id_course_name_pk" PRIMARY KEY("user_id","course_name")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"picture" text NOT NULL,
	"theme" text,
	"last_roadmap_edit_at" timestamp,
	"current_plan_index" integer DEFAULT 0 NOT NULL,
	"auto_save_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_email" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_major" (
	"user_id" integer NOT NULL,
	"major_id" text NOT NULL,
	"specialization_id" text,
	CONSTRAINT "user_major_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
CREATE TABLE "user_major_catalog_year" (
	"user_id" integer NOT NULL,
	"major_id" text NOT NULL,
	"catalog_year" text,
	CONSTRAINT "user_major_catalog_year_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
CREATE TABLE "user_minor" (
	"user_id" integer NOT NULL,
	"minor_id" text NOT NULL,
	CONSTRAINT "user_minor_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id")
);
--> statement-breakpoint
CREATE TABLE "user_minor_catalog_year" (
	"user_id" integer NOT NULL,
	"minor_id" text NOT NULL,
	"catalog_year" text,
	CONSTRAINT "user_minor_catalog_year_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id")
);
--> statement-breakpoint
CREATE TABLE "vote" (
	"review_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"vote" integer NOT NULL,
	CONSTRAINT "vote_review_id_user_id_pk" PRIMARY KEY("review_id","user_id"),
	CONSTRAINT "votes_vote_check" CHECK ("vote"."vote" = 1 OR "vote"."vote" = -1)
);
--> statement-breakpoint
CREATE TABLE "zot4plan_imports" (
	"schedule_id" text NOT NULL,
	"user_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "zot4plan_imports_schedule_id_timestamp_pk" PRIMARY KEY("schedule_id","timestamp")
);
--> statement-breakpoint
ALTER TABLE "instructorReviews" DROP CONSTRAINT "unique_review";--> statement-breakpoint
DROP INDEX "reviews_professor_id_idx";--> statement-breakpoint
DROP INDEX "reviews_course_id_idx";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_marker_requirement" ADD CONSTRAINT "completed_marker_requirement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_notes" ADD CONSTRAINT "course_notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_card" ADD CONSTRAINT "custom_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "override" ADD CONSTRAINT "override_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "override" ADD CONSTRAINT "override_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner" ADD CONSTRAINT "planner_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_course" ADD CONSTRAINT "planner_course_custom_card_id_custom_card_id_fk" FOREIGN KEY ("custom_card_id") REFERENCES "public"."custom_card"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_course" ADD CONSTRAINT "planner_course_planner_id_start_year_quarter_name_planner_quarter_planner_id_start_year_quarter_name_fk" FOREIGN KEY ("planner_id","start_year","quarter_name") REFERENCES "public"."planner_quarter"("planner_id","start_year","quarter_name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_major" ADD CONSTRAINT "planner_major_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_minor" ADD CONSTRAINT "planner_minor_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_quarter" ADD CONSTRAINT "planner_quarter_planner_id_start_year_planner_year_planner_id_start_year_fk" FOREIGN KEY ("planner_id","start_year") REFERENCES "public"."planner_year"("planner_id","start_year") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_year" ADD CONSTRAINT "planner_year_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_course" ADD CONSTRAINT "saved_course_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transferred_ap_exam_reward_selection" ADD CONSTRAINT "transferred_ap_exam_reward_selection_user_id_exam_name_transferred_ap_exam_user_id_exam_name_fk" FOREIGN KEY ("user_id","exam_name") REFERENCES "public"."transferred_ap_exam"("user_id","exam_name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transferred_ap_exam" ADD CONSTRAINT "transferred_ap_exam_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transferred_course" ADD CONSTRAINT "transferred_course_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transferred_ge" ADD CONSTRAINT "transferred_ge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transferred_misc" ADD CONSTRAINT "transferred_misc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_major" ADD CONSTRAINT "user_major_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_major_catalog_year" ADD CONSTRAINT "user_major_catalog_year_user_id_major_id_user_major_user_id_major_id_fk" FOREIGN KEY ("user_id","major_id") REFERENCES "public"."user_major"("user_id","major_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_minor" ADD CONSTRAINT "user_minor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_minor_catalog_year" ADD CONSTRAINT "user_minor_catalog_year_user_id_minor_id_user_minor_user_id_minor_id_fk" FOREIGN KEY ("user_id","minor_id") REFERENCES "public"."user_minor"("user_id","minor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zot4plan_imports" ADD CONSTRAINT "zot4plan_imports_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_card_user_id_idx" ON "custom_card" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "override_user_planner_idx" ON "override" USING btree ("user_id","planner_id");--> statement-breakpoint
CREATE INDEX "planners_user_id_idx" ON "planner" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "planner_major_planner_id_idx" ON "planner_major" USING btree ("planner_id");--> statement-breakpoint
CREATE INDEX "planner_minor_planner_id_idx" ON "planner_minor" USING btree ("planner_id");--> statement-breakpoint
CREATE INDEX "reports_review_id_idx" ON "report" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "reviews_professor_id_idx" ON "review" USING btree ("professor_id");--> statement-breakpoint
CREATE INDEX "reviews_course_id_idx" ON "review" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "transferred_courses_user_id_idx" ON "transferred_misc" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "votes_user_id_idx" ON "vote" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "instructor_reviews_professor_id_idx" ON "instructorReviews" USING btree ("professor_id");--> statement-breakpoint
CREATE INDEX "instructor_reviews_course_id_idx" ON "instructorReviews" USING btree ("course_id");--> statement-breakpoint
ALTER TABLE "instructorReviews" ADD CONSTRAINT "unique_instructor_review" UNIQUE("user_id","professor_id","course_id","quarter");