CREATE TABLE IF NOT EXISTS "planner" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "planner_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"years" jsonb[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"review_id" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"professor_id" text NOT NULL,
	"course_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"anonymous" boolean NOT NULL,
	"content" text,
	"rating" integer NOT NULL,
	"difficulty" integer NOT NULL,
	"grade_received" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"for_credit" boolean NOT NULL,
	"quarter" text NOT NULL,
	"take_again" boolean NOT NULL,
	"textbook" boolean NOT NULL,
	"attendance" boolean NOT NULL,
	"tags" text[],
	"verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "unique_review" UNIQUE("user_id","professor_id","course_id"),
	CONSTRAINT "rating_check" CHECK ("review"."rating" >= 1 AND "review"."rating" <= 5),
	CONSTRAINT "difficulty_check" CHECK ("review"."difficulty" >= 1 AND "review"."difficulty" <= 5)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_course" (
	"user_id" integer NOT NULL,
	"course_id" text NOT NULL,
	CONSTRAINT "saved_course_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transferred_course" (
	"user_id" integer,
	"course_name" text,
	"units" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"google_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"picture" text NOT NULL,
	"theme" text,
	"last_roadmap_edit_at" timestamp,
	CONSTRAINT "unique_google_id" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vote" (
	"review_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"vote" integer NOT NULL,
	CONSTRAINT "vote_review_id_user_id_pk" PRIMARY KEY("review_id","user_id"),
	CONSTRAINT "votes_vote_check" CHECK ("vote"."vote" = 1 OR "vote"."vote" = -1)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner" ADD CONSTRAINT "planner_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report" ADD CONSTRAINT "report_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_course" ADD CONSTRAINT "saved_course_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "vote" ADD CONSTRAINT "vote_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "planners_user_id_idx" ON "planner" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_review_id_idx" ON "report" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_professor_id_idx" ON "review" USING btree ("professor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_course_id_idx" ON "review" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transferred_courses_user_id_idx" ON "transferred_course" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "votes_user_id_idx" ON "vote" USING btree ("user_id");