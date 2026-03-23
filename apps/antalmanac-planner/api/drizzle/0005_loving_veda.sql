CREATE TABLE IF NOT EXISTS "planner_major" (
	"id" serial PRIMARY KEY NOT NULL,
	"planner_id" integer NOT NULL,
	"major_id" text NOT NULL,
	"specialization_id" text
);
--> statement-breakpoint
ALTER TABLE "planner" ADD COLUMN "minor_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "planner_major" ADD CONSTRAINT "planner_major_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "planner_major_planner_id_idx" ON "planner_major" USING btree ("planner_id");