CREATE TABLE IF NOT EXISTS "planner_minor" (
	"id" serial PRIMARY KEY NOT NULL,
	"planner_id" integer NOT NULL,
	"minor_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_minor" ADD CONSTRAINT "planner_minor_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "planner_minor_planner_id_idx" ON "planner_minor" USING btree ("planner_id");--> statement-breakpoint
ALTER TABLE "planner" DROP COLUMN IF EXISTS "minor_id";