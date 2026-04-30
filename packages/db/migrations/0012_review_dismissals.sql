CREATE TABLE IF NOT EXISTS "reviewDismissals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"professor_id" text NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_dismissal" UNIQUE("user_id","professor_id","course_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviewDismissals" ADD CONSTRAINT "reviewDismissals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dismissals_user_id_idx" ON "reviewDismissals" USING btree ("user_id");
