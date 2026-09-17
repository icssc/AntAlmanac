ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "environment" text;
UPDATE "subscriptions" SET "environment" = 'production' WHERE "environment" IS NULL;
