-- Add shared_with_friends column to schedules.
-- Defaults to true so existing schedules remain visible to friends.
ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "shared_with_friends" boolean NOT NULL DEFAULT true;
