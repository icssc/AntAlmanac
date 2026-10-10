ALTER TABLE "transferred_ap_exam_reward_selection" DROP CONSTRAINT "transferred_ap_exam_reward_selection_user_id_exam_name_transferred_ap_exam_user_id_exam_name_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transferred_ap_exam_reward_selection" ADD CONSTRAINT "transferred_ap_exam_reward_selection_user_id_exam_name_transferred_ap_exam_user_id_exam_name_fk" FOREIGN KEY ("user_id","exam_name") REFERENCES "public"."transferred_ap_exam"("user_id","exam_name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
