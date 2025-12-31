DO $$ 
BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
  -- Table doesn't exist, create it with new schema
  CREATE TABLE "subscriptions" (
   "userId" text,
   "sectionCode" text NOT NULL,
   "year" text NOT NULL,
   "quarter" text NOT NULL,
   "lastUpdatedStatus" text,
   "lastCodes" text DEFAULT '',
   "notifyOnOpen" boolean DEFAULT false,
   "notifyOnWaitlist" boolean DEFAULT false,
   "notifyOnFull" boolean DEFAULT false,
   "notifyOnRestriction" boolean DEFAULT false,
   CONSTRAINT "subscriptions_userId_sectionCode_year_quarter_pk" PRIMARY KEY("userId","sectionCode","year","quarter")
  );
 ELSE

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'status') THEN
   ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_userId_sectionCode_pk";
   ALTER TABLE "subscriptions" ALTER COLUMN "sectionCode" SET DATA TYPE text;
   ALTER TABLE "subscriptions" ALTER COLUMN "sectionCode" SET NOT NULL;
   ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "status";
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'year') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "year" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'quarter') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "quarter" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'lastUpdatedStatus') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "lastUpdatedStatus" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'lastCodes') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "lastCodes" text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'notifyOnOpen') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "notifyOnOpen" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'notifyOnWaitlist') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "notifyOnWaitlist" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'notifyOnFull') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "notifyOnFull" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'notifyOnRestriction') THEN
   ALTER TABLE "subscriptions" ADD COLUMN "notifyOnRestriction" boolean DEFAULT false;
  END IF;
  
  ALTER TABLE "subscriptions" ALTER COLUMN "year" SET NOT NULL;
  ALTER TABLE "subscriptions" ALTER COLUMN "quarter" SET NOT NULL;
  
  IF NOT EXISTS (
   SELECT 1 FROM pg_constraint 
   WHERE conname = 'subscriptions_userId_sectionCode_year_quarter_pk'
  ) THEN
   ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_sectionCode_year_quarter_pk" 
    PRIMARY KEY("userId","sectionCode","year","quarter");
  END IF;
 END IF;
END $$;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."subscription_target_status";