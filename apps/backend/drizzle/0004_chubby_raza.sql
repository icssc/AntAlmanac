ALTER TABLE "subscriptions" ADD COLUMN "term" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "lastUpdated" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "openStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "waitlistStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "fullStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "restrictionStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
DROP TYPE "public"."subscription_target_status";