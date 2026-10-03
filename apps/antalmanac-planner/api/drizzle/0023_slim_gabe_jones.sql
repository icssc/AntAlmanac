DROP INDEX IF EXISTS "user_major_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "user_minor_unique";--> statement-breakpoint
ALTER TABLE "user_minor" ALTER COLUMN "minor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_major" DROP CONSTRAINT IF EXISTS "user_major_pkey";
ALTER TABLE "user_minor" DROP CONSTRAINT IF EXISTS "user_minor_pkey";
ALTER TABLE "user_major" ADD CONSTRAINT "user_major_user_id_major_id_pk" PRIMARY KEY("user_id","major_id");--> statement-breakpoint
ALTER TABLE "user_minor" ADD CONSTRAINT "user_minor_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id");--> statement-breakpoint
ALTER TABLE "user_major" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "user_minor" DROP COLUMN IF EXISTS "id";