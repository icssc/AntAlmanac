CREATE TABLE IF NOT EXISTS "user_major_catalog_year" (
	"user_id" integer NOT NULL,
	"major_id" text NOT NULL,
	"catalog_year" integer,
	CONSTRAINT "user_major_catalog_year_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_minor_catalog_year" (
	"user_id" integer NOT NULL,
	"minor_id" text NOT NULL,
	"catalog_year" integer,
	CONSTRAINT "user_minor_catalog_year_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_major_catalog_year" ADD CONSTRAINT "user_major_catalog_year_user_id_major_id_user_major_user_id_major_id_fk" FOREIGN KEY ("user_id","major_id") REFERENCES "public"."user_major"("user_id","major_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_minor_catalog_year" ADD CONSTRAINT "user_minor_catalog_year_user_id_minor_id_user_minor_user_id_minor_id_fk" FOREIGN KEY ("user_id","minor_id") REFERENCES "public"."user_minor"("user_id","minor_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
