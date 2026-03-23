CREATE TABLE zot4plan_imports (
    schedule_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    CONSTRAINT zot4plan_imports_schedule_id_user_id_timestamp_pk PRIMARY KEY (schedule_id, user_id, "timestamp"),
    FOREIGN KEY (user_id) REFERENCES "user"(id)
)
