CREATE TABLE IF NOT EXISTS "transferred_ap_exam_reward_selection" (
	"user_id" integer NOT NULL,
	"exam_name" text NOT NULL,
	"path" text NOT NULL,
	"selected_index" integer NOT NULL,
	CONSTRAINT "transferred_ap_exam_reward_selection_user_id_exam_name_path_pk" PRIMARY KEY("user_id","exam_name","path")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transferred_ap_exam_reward_selection" ADD CONSTRAINT "transferred_ap_exam_reward_selection_user_id_exam_name_transferred_ap_exam_user_id_exam_name_fk" FOREIGN KEY ("user_id","exam_name") REFERENCES "public"."transferred_ap_exam"("user_id","exam_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
