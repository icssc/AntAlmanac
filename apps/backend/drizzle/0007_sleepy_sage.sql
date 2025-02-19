ALTER TABLE "subscriptions" ALTER COLUMN "sectionCode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "year" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "quarter" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "lastCodes" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "openStatus" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "waitlistStatus" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "fullStatus" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "restrictionStatus" SET DEFAULT false;