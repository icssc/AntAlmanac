CREATE TYPE "public"."mcp_token_type" AS ENUM('access', 'refresh');--> statement-breakpoint
CREATE TABLE "mcp_auth_code" (
	"code_hash" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"client_id" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"code_challenge" text NOT NULL,
	"scopes" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_auth_request" (
	"state" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"client_state" text,
	"code_challenge" text NOT NULL,
	"scopes" jsonb NOT NULL,
	"google_code_verifier" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_client" (
	"client_id" text PRIMARY KEY NOT NULL,
	"info" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_token" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"type" "mcp_token_type" NOT NULL,
	"user_id" integer NOT NULL,
	"client_id" text NOT NULL,
	"scopes" jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mcp_request_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mcp_request_day" date;--> statement-breakpoint
ALTER TABLE "mcp_auth_code" ADD CONSTRAINT "mcp_auth_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_token" ADD CONSTRAINT "mcp_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mcp_token_user_id_idx" ON "mcp_token" USING btree ("user_id");