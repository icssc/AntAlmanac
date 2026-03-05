CREATE TYPE "public"."account_type" AS ENUM('GOOGLE', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."subscription_target_status" AS ENUM('OPEN', 'WAITLISTED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" text NOT NULL,
	"account_type" "account_type" NOT NULL,
	"provider_account_id" text NOT NULL,
	CONSTRAINT "accounts_user_id_account_type_pk" PRIMARY KEY("user_id","account_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL,
	"refresh_token" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text,
	"avatar" text,
	"name" text,
	"current_schedule_id" text,
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text,
	"notes" text,
	"last_updated" timestamp with time zone NOT NULL,
	CONSTRAINT "schedules_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coursesInSchedule" (
	"scheduleId" text NOT NULL,
	"sectionCode" integer NOT NULL,
	"term" text NOT NULL,
	"color" text NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now(),
	CONSTRAINT "coursesInSchedule_scheduleId_sectionCode_term_pk" PRIMARY KEY("scheduleId","sectionCode","term")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customEvents" (
	"id" text PRIMARY KEY NOT NULL,
	"scheduleId" text NOT NULL,
	"title" text NOT NULL,
	"start" text NOT NULL,
	"end" text NOT NULL,
	"days" text NOT NULL,
	"color" text,
	"building" text,
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"userId" text,
	"sectionCode" integer,
	"status" "subscription_target_status",
	CONSTRAINT "subscriptions_userId_sectionCode_pk" PRIMARY KEY("userId","sectionCode")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_current_schedule_id_schedules_id_fk" FOREIGN KEY ("current_schedule_id") REFERENCES "public"."schedules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coursesInSchedule" ADD CONSTRAINT "coursesInSchedule_scheduleId_schedules_id_fk" FOREIGN KEY ("scheduleId") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customEvents" ADD CONSTRAINT "customEvents_scheduleId_schedules_id_fk" FOREIGN KEY ("scheduleId") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
