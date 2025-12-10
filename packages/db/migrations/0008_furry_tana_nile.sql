-- Drop the unique constraint from migration 0007
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_account_type_provider_account_id_unique";--> statement-breakpoint

-- Drop the primary key on id column from migration 0007
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey";--> statement-breakpoint

-- Drop the id column
ALTER TABLE "accounts" DROP COLUMN "id";--> statement-breakpoint

-- Restore the original composite primary key
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_account_type_pk" PRIMARY KEY("user_id","account_type");
