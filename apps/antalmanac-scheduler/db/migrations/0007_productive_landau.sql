DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS "subscriptions_new" (
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

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
   DROP TABLE "subscriptions";
  END IF;

  ALTER TABLE "subscriptions_new" RENAME TO "subscriptions";
END $$;