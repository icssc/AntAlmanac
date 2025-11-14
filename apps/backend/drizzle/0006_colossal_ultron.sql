ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_sectionCode_pk";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "sectionCode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "year" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "quarter" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "lastUpdated" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "lastCodes" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "openStatus" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "waitlistStatus" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "fullStatus" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "restrictionStatus" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_sectionCode_year_quarter_pk" PRIMARY KEY("userId","sectionCode","year","quarter");--> statement-breakpoint
DROP TYPE "public"."subscription_target_status";