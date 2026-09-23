UPDATE "subscriptions" SET "environment" = 'production' WHERE "environment" IS NULL OR "environment" = '';--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_sectionCode_year_quarter_pk";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "environment" SET DEFAULT 'production';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "environment" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_sectionCode_year_quarter_environment_pk" PRIMARY KEY("userId","sectionCode","year","quarter","environment");