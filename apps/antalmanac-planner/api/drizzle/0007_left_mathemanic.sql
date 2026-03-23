ALTER TABLE "transferred_course" RENAME TO "transferred_misc";--> statement-breakpoint
ALTER TABLE "transferred_misc" DROP CONSTRAINT "transferred_course_user_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transferred_misc" ADD CONSTRAINT "transferred_misc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
