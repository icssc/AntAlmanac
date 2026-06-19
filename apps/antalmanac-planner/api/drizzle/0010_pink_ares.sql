CREATE TABLE IF NOT EXISTS "completed_marker_requirement" (
	"user_id" integer NOT NULL,
	"marker_name" text NOT NULL,
	CONSTRAINT "completed_marker_requirement_user_id_marker_name_pk" PRIMARY KEY("user_id","marker_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completed_marker_requirement" ADD CONSTRAINT "completed_marker_requirement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
