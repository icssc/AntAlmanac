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
    INSERT INTO "subscriptions_new" (
      "userId", "sectionCode", "year", "quarter", "lastUpdatedStatus"
    )
    SELECT 
      "userId", 
      "sectionCode", 
      COALESCE("year", '2024'), -- Provide defaults for new NOT NULL columns
      COALESCE("quarter", '1'), 
      "status"                  -- Mapping old 'status' to new 'lastUpdatedStatus'
    FROM "subscriptions"
    ON CONFLICT DO NOTHING;

    DROP TABLE "subscriptions";
  END IF;

  ALTER TABLE "subscriptions_new" RENAME TO "subscriptions";
END $$;