-- Prompt dismissals and quick reviews are unique per (user, course, professor, term) instead of
-- per (user, course, professor) globally. That allows another prompt/review when the same pairing
-- appears in a later quarter. `instructorReviews.quarter` already stored the term; dismissals get
-- a new `term` column aligned with that shortName (e.g. "2026 Fall").
--
-- Old dismissal rows never recorded a term; they are backfilled with '__legacy__' so the column
-- can be NOT NULL and the new unique constraint can apply. Client keys use real term strings, so
-- legacy rows will not suppress prompts for actual terms (users may see prompts again once).

ALTER TABLE "reviewDismissals" DROP CONSTRAINT "unique_dismissal";--> statement-breakpoint
ALTER TABLE "instructorReviews" DROP CONSTRAINT "unique_review";--> statement-breakpoint
ALTER TABLE "reviewDismissals" ADD COLUMN "term" text NOT NULL DEFAULT '__legacy__';--> statement-breakpoint
ALTER TABLE "reviewDismissals" ALTER COLUMN "term" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviewDismissals" ADD CONSTRAINT "unique_dismissal" UNIQUE("user_id","professor_id","course_id","term");--> statement-breakpoint
ALTER TABLE "instructorReviews" ADD CONSTRAINT "unique_review" UNIQUE("user_id","professor_id","course_id","quarter");
