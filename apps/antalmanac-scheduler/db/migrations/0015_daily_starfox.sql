ALTER TABLE "reviewDismissals" DROP CONSTRAINT IF EXISTS "unique_dismissal";--> statement-breakpoint
ALTER TABLE "instructorReviews" DROP CONSTRAINT IF EXISTS "unique_review";--> statement-breakpoint
ALTER TABLE "reviewDismissals" ADD COLUMN IF NOT EXISTS "term" text NOT NULL DEFAULT '__legacy__';--> statement-breakpoint
ALTER TABLE "reviewDismissals" ALTER COLUMN "term" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviewDismissals" ADD CONSTRAINT "unique_dismissal" UNIQUE("user_id","professor_id","course_id","term");--> statement-breakpoint
ALTER TABLE "instructorReviews" ADD CONSTRAINT "unique_review" UNIQUE("user_id","professor_id","course_id","quarter");
