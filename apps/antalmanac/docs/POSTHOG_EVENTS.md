## PostHog Events Reference

This document summarizes the analytics events AntAlmanac sends to PostHog and provides sample queries (HogQL / SQL) you can run in the **PostHog → Data → SQL** tab for testing.

I lwk had trouble finding it so just use this link: https://us.posthog.com/project/146770/sql

### General event shape

All events are captured via `logAnalytics`:

-   **event name**: the human‑readable `action` string (e.g. `"Sign In"`, `"Click Save Button"`).
-   **properties**:
    -   `category` – high‑level area (e.g. `"Auth"`, `"Navbar"`).
    -   `error` – optional error description string when something fails.
    -   additional fields from `customProps` (e.g. `autoSave`, import‑specific props).

> When querying, the main columns to care about are:
>
> -   `event` – the event name (our `action`).
> -   `properties["category"]` – category string.
> -   `properties["error"]` – error message (may be `NULL`).
> -   `distinct_id` – identifier for the user.
> -   `timestamp` – event time.

---

## Event catalog

### Calendar Pane (`category = "Calendar Pane"`)

Event names (values of `event`):

-   `"Delete Course"`
-   `"Change Course Color"`
-   `"Copy Section Code"`
-   `"Click Custom Event Button"`
-   `"Add Custom Event"`
-   `"Delete Custom Event"`
-   `"Screenshot"`
-   `"Clear Schedule"`
-   `"Display Finals"`
-   `"Change Schedule"`
-   `"Undo"`
-   `"Redo"`
-   `"Download Schedule"`

### Auth (`category = "Auth"`)

-   `"Sign In"`
-   `"Sign In Failure"` (check `properties["error"]`)
-   `"Sign Out"`
-   `"Sign Out Failure"` (check `properties["error"]`)
-   `"Load Schedule"`
-   `"Load Schedule Failure"` (check `properties["error"]`)
-   `"Load Schedule Legacy"`
-   `"Load Schedule Legacy Failure"` (check `properties["error"]`)
-   `"Save Schedule"` (e.g. `properties["autoSave"] = true | false`)
-   `"Save Schedule Failure"` (check `properties["error"]`, `properties["autoSave"]`)

### Navbar (`category = "Navbar"`)

-   `"Click Notifications"`
-   `"Click About Page"`
-   `"Click Save Button"`
-   `"Click Load Button"`
-   `"Change Theme"`
-   `"Import Study List"`
-   `"Import Zotcourse Schedule"`
-   `"Import From Legacy Username"`

### Class Search (`category = "Class Search"`)

-   `"Manual Search"`
-   `"Fuzzy Search"`
-   `"Add Course"`
-   `"Click \"Info\""`
-   `"Click \"Prerequisites\""`
-   `"Click \"Grades\""`
-   `"Click \"Zotistics\""`
-   `"Click \"Reviews\""`
-   `"Click \"Past Enrollment\""`
-   `"Add Course to Specific Schedule"`
-   `"Copy Section Code"`
-   `"Refresh Results"`
-   `"Toggle Columns"`

### Added Classes (`category = "Added Classes"`)

-   `"Delete Course"`
-   `"Open Added Classes"`
-   `"Copy Schedule"`
-   `"Clear Schedule"`
-   `"Change Course Color"`
-   `"Copy Section Code"`

### Map (`category = "Map"`)

-   `"Open Map"`
-   `"Click on Pin"`

### AANTS (`category = "AANTS"`)

-   `"Open Manage Notifications Dialog"`
-   `"Close Manage Notifications Dialog"`
-   `"Open Section Notifications Dropdown"`
-   `"Toggle Notify on Open"`
-   `"Toggle Notify on Waitlist"`
-   `"Toggle Notify on Full"`
-   `"Toggle Notify on Restriction Changes"`
-   `"Delete Notification"`

---

## Sample SQL / HogQL queries

> In these examples, adjust the date range in the `WHERE` clause as needed.  
> PostHog’s SQL editor uses **HogQL**, which is a superset of SQL; these queries work as‑is or with minor syntax tweaks depending on your PostHog version.

### 1. Total event counts by name

Count how many times each event was fired in the last 30 days:

```sql
SELECT
  event,
  count() AS total_events
FROM events
WHERE
  timestamp >= now() - interval 30 day
GROUP BY event
ORDER BY total_events DESC
LIMIT 100
```

### 2. Count a specific event (e.g. `"Click Save Button"`)

```sql
SELECT
  count() AS click_save_events
FROM events
WHERE
  event = 'Click Save Button'
  AND timestamp >= now() - interval 30 day
```

### 3. Unique users for an event

Number of distinct users who clicked Save in the last 30 days:

```sql
SELECT
  count(DISTINCT distinct_id) AS users_who_clicked_save
FROM events
WHERE
  event = 'Click Save Button'
  AND timestamp >= now() - interval 30 day
```

### 4. Events filtered by category

All Auth events and their counts:

```sql
SELECT
  event,
  count() AS total_events
FROM events
WHERE
  properties["category"] = 'Auth'
  AND timestamp >= now() - interval 30 day
GROUP BY event
ORDER BY total_events DESC
```

### 5. Error rate for Auth flows

Compare successful vs failed Auth events:

```sql
SELECT
  event,
  count() AS total_events,
  countIf(properties["error"] != '') AS error_events
FROM events
WHERE
  properties["category"] = 'Auth'
  AND timestamp >= now() - interval 30 day
GROUP BY event
ORDER BY total_events DESC
```

### 6. Failure details for a specific action

Inspect distinct error messages for `"Save Schedule Failure"`:

```sql
SELECT
  properties["error"] AS error_message,
  count() AS occurrences
FROM events
WHERE
  event = 'Save Schedule Failure'
  AND timestamp >= now() - interval 30 day
GROUP BY error_message
ORDER BY occurrences DESC
LIMIT 50
```

### 7. Compare auto‑save vs manual save usage

```sql
SELECT
  properties["autoSave"] AS auto_save,
  count() AS total_events,
  count(DISTINCT distinct_id) AS unique_users
FROM events
WHERE
  event = 'Save Schedule'
  AND timestamp >= now() - interval 30 day
GROUP BY auto_save
ORDER BY total_events DESC
```

### 8. Daily active users for a feature

Example: daily unique users who open the map:

```sql
SELECT
  toDate(timestamp) AS day,
  count(DISTINCT distinct_id) AS users_opened_map
FROM events
WHERE
  event = 'Open Map'
  AND timestamp >= now() - interval 30 day
GROUP BY day
ORDER BY day
```

### 9. Funnel‑style inspection (sign‑in then load schedule)

Rudimentary look at users who both signed in and loaded a schedule in the last 7 days:

```sql
WITH
  users_signed_in AS (
    SELECT DISTINCT distinct_id
    FROM events
    WHERE
      event = 'Sign In'
      AND timestamp >= now() - interval 7 day
  ),
  users_loaded_schedule AS (
    SELECT DISTINCT distinct_id
    FROM events
    WHERE
      event = 'Load Schedule'
      AND timestamp >= now() - interval 7 day
  )
SELECT
  (SELECT count() FROM users_signed_in) AS signed_in_users,
  (SELECT count() FROM users_loaded_schedule) AS users_loaded_schedule,
  (
    SELECT count()
    FROM users_signed_in s
    INNER JOIN users_loaded_schedule l USING (distinct_id)
  ) AS users_did_both
```

---

## How to extend this document

-   When you add a new event:
    -   Add a new action string to the appropriate category in `analytics.ts`.
    -   Optionally add a short note here about what it represents and any important properties (e.g. `autoSave`, `importSource`, `term`).
-   When you add new `customProps`:
    -   Document the property names and value types so you can easily query them in PostHog using `properties["yourPropName"]`.
