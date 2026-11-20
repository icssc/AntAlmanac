CREATE TABLE "user_majors" (
	"user_id" text NOT NULL,
	"major_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_majors_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
ALTER TABLE "user_majors" ADD CONSTRAINT "user_majors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;