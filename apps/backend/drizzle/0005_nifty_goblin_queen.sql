ALTER TABLE "subscriptions" ADD COLUMN "year" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "quarter" text;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "term";