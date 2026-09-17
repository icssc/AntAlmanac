CREATE TABLE IF NOT EXISTS "override" (
	"user_id" integer NOT NULL,
	"planner_id" integer NOT NULL,
	"requirement" text NOT NULL,
	CONSTRAINT "override_user_id_planner_id_requirement_pk" PRIMARY KEY("user_id","planner_id","requirement")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "override" ADD CONSTRAINT "override_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "override" ADD CONSTRAINT "override_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "override_user_planner_idx" ON "override" USING btree ("user_id","planner_id");