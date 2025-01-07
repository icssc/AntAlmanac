CREATE TYPE "public"."last_updated_status" AS ENUM('OPEN/WAITLISTED', 'WAITLISTED/OPEN', 'FULL/OPEN', 'OPEN/FULL');--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "term" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "lastUpdated" "last_updated_status";