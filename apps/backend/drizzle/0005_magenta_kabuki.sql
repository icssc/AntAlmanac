ALTER TABLE "subscriptions" ADD COLUMN "openStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "waitlistStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "fullStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "restrictionStatus" boolean;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "public"."subscriptions" ALTER COLUMN "lastUpdated" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."last_updated_status";--> statement-breakpoint
CREATE TYPE "public"."last_updated_status" AS ENUM('WAITLISTED', 'OPEN', 'FULL');--> statement-breakpoint
ALTER TABLE "public"."subscriptions" ALTER COLUMN "lastUpdated" SET DATA TYPE "public"."last_updated_status" USING "lastUpdated"::"public"."last_updated_status";--> statement-breakpoint
DROP TYPE "public"."subscription_target_status";