ALTER TABLE "subscriptions" RENAME COLUMN "openStatus" TO "notifyOnOpen";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "waitlistStatus" TO "notifyOnWaitlist";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "fullStatus" TO "notifyOnFull";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "restrictionStatus" TO "notifyOnRestriction";