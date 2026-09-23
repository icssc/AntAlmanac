ALTER TABLE "zot4plan_imports" DROP CONSTRAINT "zot4plan_imports_schedule_id_user_id_timestamp_pk";--> statement-breakpoint
ALTER TABLE "zot4plan_imports" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "zot4plan_imports" ADD CONSTRAINT "zot4plan_imports_schedule_id_timestamp_pk" PRIMARY KEY("schedule_id","timestamp");