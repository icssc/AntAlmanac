-- Drop redundant index: composite PK (requester_id, addressee_id) already supports queries on requester_id.
DROP INDEX IF EXISTS "requester_idx";--> statement-breakpoint
-- Prevent self-friendships: requester and addressee must be different.
DELETE FROM "friendships" WHERE "requester_id" = "addressee_id";--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_no_self_friend" CHECK ("requester_id" <> "addressee_id");
