CREATE TABLE IF NOT EXISTS "instructorReviews" (
	"id" text PRIMARY KEY NOT NULL,
	"professor_id" text NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text,
	"anonymous" boolean DEFAULT true NOT NULL,
	"content" text,
	"rating" integer NOT NULL,
	"difficulty" integer,
	"grade_received" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"for_credit" boolean,
	"quarter" text NOT NULL,
	"take_again" boolean,
	"textbook" boolean,
	"attendance" boolean,
	"tags" text[],
	"verified" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'antalmanac' NOT NULL,
	CONSTRAINT "unique_review" UNIQUE("user_id","professor_id","course_id"),
	CONSTRAINT "rating_check" CHECK ("instructorReviews"."rating" >= 1 AND "instructorReviews"."rating" <= 5),
	CONSTRAINT "difficulty_check" CHECK ("instructorReviews"."difficulty" IS NULL OR ("instructorReviews"."difficulty" >= 1 AND "instructorReviews"."difficulty" <= 5))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "instructorReviews" ADD CONSTRAINT "instructorReviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_professor_id_idx" ON "instructorReviews" USING btree ("professor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_course_id_idx" ON "instructorReviews" USING btree ("course_id");