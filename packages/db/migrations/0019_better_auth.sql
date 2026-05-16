ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_account_type_pk";
ALTER TABLE "accounts" DROP COLUMN "id";
ALTER TABLE "accounts" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "verifications" DROP COLUMN "id";
ALTER TABLE "verifications" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;