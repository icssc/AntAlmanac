CREATE INDEX IF NOT EXISTS "sessions_refresh_token_idx" ON "sessions" USING btree ("refresh_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customEvents_scheduleId_idx" ON "customEvents" USING btree ("scheduleId");