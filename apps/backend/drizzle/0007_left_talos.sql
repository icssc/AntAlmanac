-- Drop the old composite primary key
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_account_type_pk";--> statement-breakpoint

-- Add id column (nullable first to allow backfill)
ALTER TABLE "accounts" ADD COLUMN "id" text;--> statement-breakpoint

-- Generate CUIDs for existing rows using a function
DO $$
DECLARE
    row_record RECORD;
    new_id TEXT;
BEGIN
    FOR row_record IN SELECT ctid FROM "accounts" WHERE "id" IS NULL
    LOOP
        -- Generate a CUID-like ID (using gen_random_uuid as a fallback)
        -- In production, this will be handled by the application layer
        new_id := 'acc_' || substring(md5(random()::text), 1, 24);
        UPDATE "accounts" SET "id" = new_id WHERE ctid = row_record.ctid;
    END LOOP;
END $$;--> statement-breakpoint

-- Make id column NOT NULL and set as primary key
ALTER TABLE "accounts" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD PRIMARY KEY ("id");--> statement-breakpoint

-- Add unique constraint to ensure a provider account can only link to one user
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_account_type_provider_account_id_unique" UNIQUE("account_type","provider_account_id");
