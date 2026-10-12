CREATE TABLE IF NOT EXISTS "user_major" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"major_id" text NOT NULL,
	"specialization_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_minor" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"minor_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_major" ADD CONSTRAINT "user_major_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_minor" ADD CONSTRAINT "user_minor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
