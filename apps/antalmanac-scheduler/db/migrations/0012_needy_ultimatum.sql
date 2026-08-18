ALTER TABLE "customEvents" DROP CONSTRAINT "customEvents_pkey";--> statement-breakpoint
ALTER TABLE "customEvents" ADD CONSTRAINT "customEvents_scheduleId_id_pk" PRIMARY KEY("scheduleId","id");
