CREATE TYPE "public"."provider" AS ENUM('GOOGLE', 'APPLE');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"user_id" integer NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_user_id_provider_pk" PRIMARY KEY("user_id","provider"),
	CONSTRAINT "unique_provider_account_id" UNIQUE("provider_account_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "account" ("user_id", "provider", "provider_account_id")
SELECT "id", 'GOOGLE', "google_id" FROM "user";
