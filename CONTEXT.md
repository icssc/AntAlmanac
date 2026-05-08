# AntAlmanac

AntAlmanac is a schedule planner for UCI students. Users search for classes, build schedule alternatives on an integrated calendar, persist them to the cloud, and optionally subscribe to enrollment notifications.

## Language

### Scheduling

**Schedule**:
A named collection of courses and custom events representing one possible quarter plan. A user may have many schedules open simultaneously to compare alternatives.
_Avoid_: timetable, plan (overloaded with Planner/roadmap).

**Course**:
A specific section of a UCI class added to a schedule. Carries department, number, title, section metadata, and a display color.
_Avoid_: class (ambiguous with programming), section (too narrow — a course in this context wraps a section).

**Custom Event**:
A user-created repeating time block (e.g. work, commute) placed on the calendar alongside courses.
_Avoid_: event (too generic), appointment.

**Schedule Save State**:
The serialized snapshot of all a user's schedules, courses, and custom events — the unit of persistence exchanged between client and server.
_Avoid_: user data blob, payload.

### Search & Data

**Term**:
An academic quarter (e.g. "Fall 2025") for which a Schedule of Classes is available.
_Avoid_: quarter (overloaded with Planner quarter concept).

**Section Code**:
The unique numeric identifier for a specific section offering within a term (e.g. 36040).
_Avoid_: course code, class number.

**WebSOC**:
UCI's Web Schedule of Classes — the upstream data source for section availability, times, instructors, and enrollment status. Accessed via Anteater API.
_Avoid_: registrar, class list.

**Anteater API**:
The external ICSSC-maintained REST API that wraps UCI data sources (WebSOC, grades, enrollment history, course catalog).
_Avoid_: backend API, our API (that's the tRPC layer).

### Notifications

**Subscription**:
A user's registration to be notified when a specific section's enrollment status changes. Scoped to a term, section code, and environment (stage).
_Avoid_: notification (that's the event), watch, alert.

**AANTS**:
AntAlmanac Notification Service — the Lambda-based worker that polls WebSOC for status changes and dispatches notification emails via SQS/SES.
_Avoid_: notifier, email service.

### Users & Auth

**Session**:
A server-side record linking a browser cookie to an authenticated user. Validated on every tRPC request via the context.
_Avoid_: token, login (those are steps in creating a session).

**Guest Schedule**:
A publicly-shared read-only schedule, retrieved by username without authentication.
_Avoid_: shared schedule, public link.

### Planner

**Roadmap**:
A multi-year degree plan imported from the Planner service, containing quarters and courses. Distinct from a schedule (which is a single-term calendar).
_Avoid_: plan, degree audit.

## Relationships

- A user owns many **Schedules**, persisted as a **Schedule Save State**.
- A **Schedule** contains many **Courses** and **Custom Events**.
- A **Course** references a **Section Code** within a **Term**.
- A **Subscription** ties a user + **Section Code** + **Term** to notification preferences.
- **AANTS** reads **Subscriptions** and polls **WebSOC** to detect changes.
- A **Roadmap** is fetched from Planner and displayed alongside **Schedules** but stored externally.

## Example dialogue

> **Dev:** "When a user adds a **Course** to a **Schedule**, does it hit the server?"
> **Domain expert:** "No — the **Course** is only local state until the user saves, which persists the entire **Schedule Save State**."

> **Dev:** "What's the difference between a **Subscription** and a notification?"
> **Domain expert:** "A **Subscription** is what the user creates. A notification is the email **AANTS** sends when the section status changes."

## Flagged ambiguities

- "schedule" was used both for the UI concept (a named tab of courses) and the database row (`schedules` table). Resolved: **Schedule** is the domain concept; the DB row is an implementation detail.
- "notification" was used for both the subscription record and the email event. Resolved: **Subscription** is the persistent record; "notification" is the transient email dispatch.
- "userData" conflates authentication, schedule persistence, and profile into one tRPC namespace. This is flagged as an architectural concern, not a vocabulary issue.
