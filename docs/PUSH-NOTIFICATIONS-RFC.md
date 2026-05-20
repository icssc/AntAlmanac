# RFC: Push Notifications for AntAlmanac

| | |
| --- | --- |
| **Status** | Draft — open for review |
| **Author** | _(your name)_ |
| **Created** | 2026-05-20 |
| **Reviewers** | _(assign maintainers)_ |
| **Target release** | TBD |
| **Related code** | `apps/aants/`, `apps/pwa/`, `apps/antalmanac/`, `packages/db/`, `sst.config.ts` |

## Summary

Add native push notifications to AntAlmanac, delivered to the iOS App Store build (and, in a later phase, to Android and browser PWA installs). Push will be a second delivery channel alongside the existing email pipeline, sharing the same producer (AANTS) and the same notification preferences. The first user-visible feature is **per-section transactional pushes** (e.g. "MATH 2B 12345 just opened"), reusing the existing WebSOC-diffing cron. A second phase adds **broadcast pushes** for lifecycle events like "WebSOC opens today — registration is now open."

The proposed delivery backbone is **AWS SNS Mobile Push**, which delivers to iOS via APNs directly and to Android via FCM (when we ship Android), with a single `sns:Publish` call from a new SQS-driven Lambda. This keeps the runtime stack AWS-only, mirrors the architecture of the existing email pipeline, and defers any Firebase project setup until the moment we ship an Android client.

## Motivation

Email is currently the only channel by which AntAlmanac notifies users of section status changes (see `apps/aants/README.md`). Email is high-latency, is filtered aggressively by Gmail, and is invisible to users who installed AntAlmanac as a native app. Now that the iOS App Store build is shipping (`apps/pwa/`), the App Store user expects native push for time-sensitive events:

- **Per-section transactional pushes** — a section the user is subscribed to opens, fills, waitlists, or changes restriction codes. Today these go out as email via the AANTS pipeline. Push is a much better fit because enrollment decisions are typically made within minutes of a state change.
- **Broadcast / lifecycle pushes** — time-based reminders to the install base, such as "WebSOC opens today, plan your schedule" on the term's `socAvailable` date.

The iOS shell was scaffolded from PWABuilder and ships with a partially-wired Firebase Messaging integration that has never been finished — see `apps/pwa/src/AntAlmanac/PushNotifications.swift` and the commented-out `FirebaseApp.configure()` at `apps/pwa/src/AntAlmanac/AppDelegate.swift` line 16. This RFC proposes finishing the push story end-to-end, with a design that does not lock us to Firebase as a vendor.

## Goals

1. Deliver per-section transactional pushes from the existing AANTS cron to users on the iOS App Store build, with the same business-rule semantics as today's emails (`notifyOnOpen` / `notifyOnWaitlist` / `notifyOnFull` / `notifyOnRestriction`).
2. Allow push and email to be enabled independently per subscription, so a user can mute one without losing the other.
3. Add a broadcast push channel for time-scheduled lifecycle events (the `socAvailable`-driven "registration opens today" message).
4. Keep the runtime stack AWS-only. No Firebase Admin SDK in the Lambda code for the iOS-only phase.
5. Extensible to Android and to browser web push without rewriting the backend pipeline.
6. Reuse the existing SQS + DLQ + partial-batch-failure delivery shape from `apps/aants/src/emailProcessor.ts` so operational tooling carries over.

## Non-goals

- **Marketing / segmentation tooling** (campaigns, A/B testing, audience segments). If we ever need that, AWS End User Messaging Push or Braze is the right answer, not this RFC.
- **Migrating the existing email pipeline.** Email keeps working unchanged.
- **iOS rich-media / interactive notifications** in v1. Plain title + body + deep-link `data` payload is enough for the use cases above.
- **Replacing the iOS PWABuilder shell.** We are finishing the bridge code in the existing shell, not building a new native app.
- **Push to Apple Watch, CarPlay, macOS Catalyst** as separate targets. They inherit from the iOS target if they happen to work; we don't QA them.

## Background

### Today's notification pipeline

Two Lambdas, defined in `sst.config.ts`:

- **`AantsLambda`** (cron, `rate(5 minutes)`) — calls `scanAndNotify()` in `apps/aants/src/index.ts`. Reads distinct subscribed sections from `subscriptions`, hits Anteater API, diffs against `lastUpdatedStatus` / `lastCodes`, filters by per-user `notifyOn*` flags, and enqueues per-user SQS messages via `apps/aants/src/helpers/notificationDispatch.ts`.
- **`EmailProcessorLambda`** — drains `EmailQueue` in batches of 14 (SES rate limit), calls `SESv2.SendEmail` per record, returns `SQSBatchItemFailure[]` for partial-batch retry. DLQ retains failed messages 14 days after 3 retries.

The decision of "who to notify, why, and with what payload" is centralised in `processSection()` → `filterUsersToNotify()`. The delivery channel is a pure downstream consumer of an SQS message.

### Existing iOS shell

`apps/pwa/` is the PWABuilder-generated WKWebView shell.

- `Podfile` pulls in `Firebase/Messaging`.
- `apps/pwa/src/AntAlmanac/PushNotifications.swift` exposes JS↔native bridge handlers (`push-subscribe`, `push-permission-request`, `push-permission-state`, `push-token`) and dispatches DOM `CustomEvent`s back into the WKWebView.
- `apps/pwa/src/AntAlmanac/Entitlements/Entitlements.plist` declares `aps-environment=production`.
- `apps/pwa/src/AntAlmanac/Info.plist` declares the `remote-notification` background mode.

What's not wired:

- `FirebaseApp.configure()` and `application.registerForRemoteNotifications()` are commented out (`AppDelegate.swift` lines 16 and 32).
- `GoogleService-Info.plist` is the unfilled PWABuilder placeholder.
- No JS on the antalmanac.com side ever calls the bridge handlers (a workspace-wide search for `webkit.messageHandlers` / `push-subscribe` in `apps/antalmanac/src/` returns zero matches).

### Existing data model

`packages/db/src/schema/subscription.ts` is the per-section subscription table. Primary key `(userId, sectionCode, year, quarter, environment)`. Has `notifyOnOpen`, `notifyOnWaitlist`, `notifyOnFull`, `notifyOnRestriction` booleans. `environment` keeps staging stacks isolated from production tokens.

`packages/db/src/schema/auth/user.ts` is the user table.

There is no schema for push tokens or device registrations today.

## Proposed design

### High-level architecture

The producer side of the pipeline is unchanged. We fan out to two queues instead of one, and add a second consumer.

```text
+-----------------+
|  AANTS cron     |
|  (apps/aants)   |
+--------+--------+
         |
         |    --> EmailQueue --> EmailProcessorLambda --> SES (existing)
         |
         +--> PushQueue  --> PushProcessorLambda  --> SNS Mobile Push
                                                      |--> APNs (iOS)
                                                      |--> FCM  (Android, phase 2)
+-----------------+
| BroadcastCron   |
| (new, daily)    | --> PushQueue --> PushProcessorLambda --> ...
+-----------------+
```

Both queues have the same retry + DLQ + partial-batch-failure shape as today's `EmailQueue`.

### Why AWS SNS Mobile Push

SNS Mobile Push is the cleanest fit for AntAlmanac's AWS-native posture:

- **iOS.** SNS speaks APNs natively. Upload an APNs `.p8` auth key to SNS once, call `sns:Publish` against per-device `EndpointArn`s. No Firebase project, no Google account, no GCP setup of any kind.
- **Android (later).** SNS calls FCM on our behalf. Google requires FCM as the only path to Android devices — no push system on Earth bypasses this. We register one free Firebase project, upload its service-account JSON to SNS once, and the publisher Lambda never imports a Firebase SDK or sees Google credentials at runtime.
- **Single API surface.** The publisher calls `sns:Publish(EndpointArn, payload)` regardless of whether that endpoint terminates at APNs or FCM.
- **IAM-only.** No service-account JSON to rotate in Secrets Manager. Lambda permissions live in `sst.config.ts` next to the existing SES/SQS perms.
- **Capacity.** In `us-east-2` (our region — see SES ARNs in `sst.config.ts` lines 114-117), the `Publish` soft quota is 9,000 msgs/sec per account. AntAlmanac's full install base could be paged in seconds; this ceiling will never bite us.
- **Cost.** $0.50 per million publishes; first 1M/month free per account. Effectively free at our scale.

Alternatives are documented in the "Alternatives considered" section.

### Data model changes

One new table plus two columns on `subscriptions`. Drizzle migrations live in `packages/db/migrations/`.

```typescript
// packages/db/src/schema/pushDevice.ts (proposed)
export const pushDevices = pgTable('push_devices', {
    id: text('id').primaryKey().$defaultFn(createId),
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),

    /**
     * The raw push token issued by the OS:
     *   - iOS: APNs device token (64-char hex)
     *   - Android (phase 2): FCM registration token
     * Used to look up or re-create the SNS endpoint ARN below.
     */
    token: text('token').notNull(),

    /**
     * The SNS platform endpoint ARN we publish to. Created via
     * sns:CreatePlatformEndpoint(token, platformApplicationArn). May be
     * disabled by SNS in response to APNs/FCM "unregistered" feedback.
     */
    endpointArn: text('endpoint_arn').notNull(),

    platform: text('platform').notNull(), // 'ios' | 'android' | 'web'

    /**
     * False once SNS has marked the endpoint Enabled=false (e.g. the user
     * uninstalled the app or the token rotated). The push processor flips
     * this and stops publishing to dead endpoints.
     */
    enabled: boolean('enabled').default(true).notNull(),

    appVersion: text('app_version'),
    locale: text('locale'),

    /**
     * Same staging-isolation discriminator as subscriptions.environment.
     * AANTS only delivers when its STAGE matches.
     */
    environment: text('environment').notNull().default('production'),

    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (t) => [
    uniqueIndex('push_devices_token_unique').on(t.token),
    index('push_devices_user_idx').on(t.userId),
]);
```

Per-channel preference toggles on the existing `subscriptions` table:

```typescript
notifyByEmail: boolean('notify_by_email').default(true).notNull(),
notifyByPush:  boolean('notify_by_push').default(true).notNull(),
```

For broadcast pushes (no per-section row), a single per-user opt-in. Either add to `users` or split into a new `userNotificationPrefs` table; the simpler move is a column on `users`:

```typescript
broadcastPushOptIn: boolean('broadcast_push_opt_in').default(false).notNull(),
```

We default broadcast opt-in to **false** so Apple's App Review can verify the prompt is gated behind explicit user action.

A broadcast idempotency table to prevent double-sending if the daily cron re-runs:

```typescript
export const broadcastsSent = pgTable('broadcasts_sent', {
    key: text('key').notNull(),                  // e.g. "soc_opens_2026_Spring"
    environment: text('environment').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true })
        .defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.key, t.environment] })]);
```

### Backend pipeline

**1. AANTS producer (`apps/aants/src/`).**

`sendNotification()` in `helpers/notificationDispatch.ts` currently produces one SQS email per user. After this RFC, it also produces SQS push messages for users whose subscription has `notifyByPush=true` AND who have at least one `enabled=true` row in `push_devices` for the current `STAGE`.

Both fan-outs are independent: a user with email on and push off gets only email; a user with both on gets both; a user with push on and no devices registered gets only email (with no error — they just haven't installed the app yet).

A new helper `pushQueue.ts` mirrors `emailQueue.ts`:

```typescript
export interface PushRequest {
    userId: string;
    targets: { endpointArn: string; platform: 'ios' | 'android' | 'web' }[];
    notification: { title: string; body: string };
    data: AntalmanacPushPayloadData;   // typed, see "Payload contract"
    logContext: {
        kind: 'section_status_change' | 'broadcast' | ...;
        deptCode?: string;
        courseNumber?: string;
        sectionCode?: string;
    };
}

export async function queuePush(req: PushRequest): Promise<void> { ... }
```

**2. PushProcessorLambda (new, `apps/aants/src/pushProcessor.ts`).**

Mirrors `emailProcessor.ts`:

- Consumes from `PushQueue`. Batch size sized to SNS throughput, not APNs — we don't have to throttle at SES rates anymore.
- For each `(endpointArn, platform)` pair in the message, calls `SNSClient.publish({ TargetArn: endpointArn, Message: ..., MessageStructure: 'json' })` with platform-specific subtree (`APNS` or `GCM`).
- On SNS response `EndpointDisabled`, flip the corresponding `push_devices` row to `enabled=false` (or delete; see "Open questions"). Don't bubble the error to SQS — it's not a retry-worthy failure.
- All other errors: push to `SQSBatchItemFailure[]` for SQS retry, mirroring `emailProcessor.ts` lines 48-66.

**3. BroadcastNotifierLambda (new, `apps/aants/src/broadcastNotifier.ts`).**

A second `sst.aws.Cron` running once daily at 09:00 PT. Each run:

1. Reads `termData.json` (already bundled in `apps/antalmanac/src/generated/`; move/copy into a shared package so the Lambda can import it without pulling in the Next.js app).
2. Computes a broadcast key for any term whose `socAvailable` falls today.
3. If `broadcasts_sent` already has a row for `(key, STAGE)`, skip.
4. Otherwise, query all `push_devices` rows where the joined user has `broadcastPushOptIn=true` and `environment=STAGE`. Enqueue one `PushRequest` per device to `PushQueue` with the broadcast payload.
5. Insert into `broadcasts_sent` to seal idempotency.

We also leave room for a manual broadcast trigger (an authenticated tRPC admin endpoint) for ad-hoc messages, but it's not in v1 scope.

**4. SST infra (`sst.config.ts`).**

Adds (formulaic copies of the existing Email resources):

- `PushDLQ` — `sst.aws.Queue` with 14-day retention.
- `PushQueue` — `sst.aws.Queue` with 3-minute visibility timeout, DLQ + 3 retries, partial-batch-failure response config.
- `PushProcessorLambda` — `sst.aws.Function` subscribed to `PushQueue` with `sns:Publish`, `sns:GetEndpointAttributes`, `sns:SetEndpointAttributes` permissions on the platform application ARNs.
- `BroadcastNotifierLambda` — `sst.aws.Function` + `sst.aws.Cron`.
- A new `sst.aws.SnsPlatformApplication` resource (or raw `aws.sns.PlatformApplication` if SST doesn't expose a wrapper) per (platform × stage):
    - `APNS_AntAlmanac_production`
    - `APNS_SANDBOX_AntAlmanac_staging`
    - (Phase 2: same for FCM)

`AantsLambda` gets `sqs:SendMessage` on `PushQueue` in addition to `EmailQueue`. Same `AANTS_STAGES` gate; the resources only exist on production and the two long-lived staging stacks.

### iOS client

We finish the bridge that's already in `apps/pwa/`, but **replace Firebase-specific code with native APNs handling**, and add a backend registration call.

Changes in `apps/pwa/src/AntAlmanac/`:

1. **Remove the Firebase pod** from `Podfile`. We no longer need `Firebase/Messaging`.
2. **`AppDelegate.swift`**:
    - Remove `Firebase` / `FirebaseMessaging` imports and `MessagingDelegate` conformance.
    - Uncomment `application.registerForRemoteNotifications()` at line 32.
    - Implement `application(_, didRegisterForRemoteNotificationsWithDeviceToken:)` — the stub is already commented in at lines 80-85. The body converts the `Data` token to hex, then forwards it to the JS bridge via the existing `checkViewAndEvaluate(event: "push-token", detail: ...)` pattern.
3. **`PushNotifications.swift`**:
    - Delete `SubscribeMessage`, `handleSubscribeTouch`, `parseSubscribeMessage`, `handleFCMToken` (FCM topic semantics aren't useful for our model — we fan out per-user from the backend, not per-topic).
    - Keep `handlePushPermission`, `handlePushState`, `sendPushToWebView`, `sendPushClickToWebView` as-is — these are transport-agnostic.
4. **`ViewController.swift`**:
    - Drop the `push-subscribe` message handler at line 13. Leave the others.

This is roughly 50-100 lines of Swift to rewrite, contained to those three files. Apple Developer Console setup (Push Notifications capability on the Bundle ID, upload `.p8` to SNS) is configuration, not code.

### Web client (the antalmanac.com side)

Currently the web side has zero push integration. We add a small layer in `apps/antalmanac/src/lib/push/` that handles both:

1. **Native iOS bridge** (when `isNativeIosApp()` from `lib/platform.ts`):

    ```typescript
    // lib/push/native.ts
    export async function requestNativePushPermission(): Promise<PermissionState> { ... }
    export async function getNativePushToken(): Promise<string> { ... }
    ```

    These call `window.webkit.messageHandlers['push-permission-request'].postMessage(...)` and listen for the corresponding `CustomEvent` the Swift code dispatches.

2. **Web Push** (browsers / standalone PWA, phase 2). Use either the FCM JS SDK or the W3C Push API directly with VAPID keys and the `web-push` library on the backend.

3. **Token registration** (both paths). On successful token retrieval, POST to a new tRPC mutation `notifications.registerDevice({ token, platform })`, which calls `sns:CreatePlatformEndpoint` server-side and upserts a `push_devices` row.

UI placement — opt-in toggle inside the existing `NotificationsDialog.tsx`, plus a one-time soft prompt after sign-in for installed-app users. Per Apple App Review rules, the permission prompt must be triggered by a clear user gesture, so the toggle is the canonical entry point. The existing `NotificationsDialog` is gated behind `isGoogleUser` already; we don't widen that gate.

### Payload contract

Lives in `packages/types` so the producer Lambda, push processor, web app, and iOS bridge agree on shape:

```typescript
export interface AntalmanacPushPayload {
    kind: 'section_status_change' | 'broadcast_soc_opens' | ...;
    title: string;                     // "MATH 2B 12345 just opened!"
    body: string;                      // "Lecture A, MWF 9-9:50, Smith. Tap to add."
    data: {
        messageId: string;             // for client-side de-dup
        deepLink?: string;             // e.g. "/?term=Fall+2026&sectionCode=12345"
        sectionCode?: string;
        deptCode?: string;
        courseNumber?: string;
        term?: string;
    };
}
```

The push processor builds the platform-specific envelope around this:

```typescript
// APNs (iOS)
{
    aps: { alert: { title, body }, sound: 'default', 'mutable-content': 1 },
    ...data,
}

// FCM (Android, phase 2)
{
    notification: { title, body },
    data: { ...data },
}
```

Both envelopes deliver the same `data` keys to the client, so the click / foreground handlers on iOS and Android (and the web service worker, when we add it) can share a single deep-link parser.

### Staging isolation

Reuse the `environment` column pattern AANTS already uses. `PushQueue`, `PushProcessorLambda`, and the SNS Platform Applications are only created in the existing `AANTS_STAGES = ['production', 'staging-1521', 'staging-1542']` list (`sst.config.ts` line 18). Staging publishes against `APNS_SANDBOX` (against TestFlight builds), production against `APNS`. The push processor adds a `[STAGING]` title prefix in non-production stages, mirroring the email `stagingPrefix` at `notificationDispatch.ts` lines 118-120.

## Alternatives considered

### Alt 1: Firebase Cloud Messaging directly (`firebase-admin` in the Lambda)

This is the path the PWABuilder template documents and what the inherited Swift code is already wired against.

Pros:

- ~2 lines of Swift to finish on iOS (`AppDelegate.swift` lines 16 and 32) plus dropping in a real `GoogleService-Info.plist`.
- The published PWABuilder JS-bridge example (`khmyznikov/ios-pwa-shell/src/components/push.ts`) is a turnkey starting point on the web side.
- Free, single project covers iOS + Android + Web Push.

Cons:

- Adds a second cloud (Google Cloud / Firebase) to operate alongside AWS. Service-account JSON to rotate, GCP billing email, second status-page to watch.
- `firebase-admin` runs inside our Lambda, so its supply chain is a production dependency.
- The "stay AWS-only" preference expressed during scoping isn't preserved.

**Verdict:** rejected for v1, but the migration cost back to this path is small if we ever change our minds (one Lambda's contents + one credential source).

### Alt 2: Direct APNs (apns2 / http2) for iOS

Skip both SNS and Firebase, talk HTTP/2 to `api.push.apple.com` directly from the Lambda with an APNs JWT.

Pros:

- Zero AWS-managed glue. Just an HTTP client.

Cons:

- We manage the JWT cache, the HTTP/2 connection pool, APNs error semantics, token-rotation feedback, and per-device retry logic ourselves. SNS does all of this.
- Adding Android later means writing a parallel HTTP/2 client for FCM. No unified `Publish` surface.

**Verdict:** rejected. Reinvents wheels SNS gives us for free.

### Alt 3: Hybrid (FCM for iOS, SNS for Android)

The "use the inherited iOS code, then add SNS later only for Android" path.

Pros: minimal iOS-side change.

Cons: two delivery code paths in the publisher Lambda permanently, two credentials, two failure modes to monitor. Doubles operational surface for no real benefit.

**Verdict:** rejected.

### Alt 4: AWS End User Messaging Push (the rebranded Pinpoint push)

In 2024 AWS rebranded Pinpoint's push functionality under "AWS End User Messaging Push" and announced Pinpoint sunset on 2026-10-30. The push functionality continues.

Pros: integrates with the campaigns / segments features of End User Messaging.

Cons: heavier service than we need; designed for marketing-campaign use cases that are explicit non-goals. SNS Mobile Push is the simpler primitive and fits transactional + scheduled-broadcast pushes cleanly.

**Verdict:** rejected for this RFC. Revisit if we ever need campaign segmentation.

## Rollout plan

The phases are written in dependency order; each lands behind a flag or has no user-visible effect until the next phase enables it.

### Phase 0 — DB + types

- Migration adding `push_devices`, `subscriptions.notifyByEmail` / `notifyByPush`, `users.broadcastPushOptIn`, `broadcasts_sent`.
- `AntalmanacPushPayload` type in `packages/types`.

No behaviour change. Unblocks every other phase.

### Phase 1 — SNS Platform Application + iOS shell wiring

- Apple Developer Console: enable Push Notifications capability on the bundle, regenerate provisioning profile, upload `.p8` to SNS, create `APNS_AntAlmanac_production` and `APNS_SANDBOX_AntAlmanac_staging` platform applications in `sst.config.ts`.
- Swift refactor in `apps/pwa/` (remove Firebase, wire native APNs token to the existing bridge).
- TestFlight build that, once permission is granted, logs the APNs token to the WebView console.

No user-visible behaviour yet — there's no UI to grant permission, and the backend doesn't send pushes.

### Phase 2 — Token registration + opt-in UI

- `notifications.registerDevice` tRPC mutation + `RDS.upsertPushDevice`.
- Notifications dialog gains a "Push notifications" toggle. On enable, walks through the iOS permission flow + posts the token.
- A user can toggle on, see a row in `push_devices`, and nothing else happens, because the producer doesn't fan out yet.

### Phase 3 — Producer fan-out for per-section transactional pushes

- `pushQueue.ts` helper + `pushProcessor.ts` Lambda + SST resources.
- `sendNotification()` in AANTS gains a push branch alongside the email branch, gated on `notifyByPush` + presence of an enabled device.
- First end-to-end: a status change in `staging-1521` → push lands on a TestFlight device.

This is the first user-visible push notification.

### Phase 4 — Broadcast push

- `BroadcastNotifierLambda` + daily cron + `broadcasts_sent` idempotency.
- Notifications dialog gains a "Term-lifecycle reminders" toggle that flips `broadcastPushOptIn`.
- "WebSOC opens today" fires on next applicable `socAvailable` date.

### Phase 5 — Web push (deferred)

- Browser-side `firebase-messaging-sw.js` or W3C Push API.
- New `web` platform in `push_devices`.
- Adds a `web-push` library call inside `PushProcessorLambda`, or a separate small consumer for web-push if it grows.

### Phase 6 — Android (deferred until there's an Android client)

- Register one free Firebase project, generate FCM service-account JSON, upload to SNS as a new `FCM_AntAlmanac_production` platform application.
- Android client sends FCM token to the same `notifications.registerDevice` mutation with `platform: 'android'`.
- **Zero changes to `pushProcessor.ts`** — `sns:Publish(EndpointArn)` is platform-blind on our end.

## Operational considerations

### Endpoint lifecycle

Apple and Google rotate device tokens silently. SNS' recommended pattern, copied from the [SNS best-practices doc](https://docs.aws.amazon.com/sns/latest/dg/mobile-push-notifications-best-practices.html):

1. Each app launch, re-register with APNs (Apple's recommendation). Resend the resulting token to our backend.
2. Backend calls `sns:CreatePlatformEndpoint` (idempotent on token). If the returned `EndpointArn` doesn't match the one we stored, update the row.
3. If publish returns `EndpointDisabled`, mark the row `enabled=false`. The next app launch will re-register and we'll re-enable via `SetEndpointAttributes` or create a fresh endpoint.

Optionally subscribe to SNS Platform Application Event Notifications (an SNS topic SNS publishes lifecycle events to). It fires `EndpointDeleted`, `DeliveryFailure`, etc. and plugs into a Lambda the same way our queues do. We can defer this; the synchronous-on-publish path is enough for v1.

### Observability

- Enable Delivery Status Logging on the SNS Platform Applications. Free, writes APNs response codes to CloudWatch — the only sane way to debug "I didn't get the push".
- Mirror the `[BATCH]` / `[PROCESSING]` / `[SKIP]` console.log pattern already used in `apps/aants/src/index.ts` so it slots into our existing log searches.
- Surface a new CloudWatch metric: push success rate by platform, broken out by environment.

### Limits to plan around

In `us-east-2` (our region):

- `Publish` — 9,000 msgs/sec soft. We're 3 orders of magnitude under this at full UCI scale.
- `CreatePlatformEndpoint` — 150 TPS soft. Only an issue during pathological mass-registration bursts. We can queue around it or request a raise.
- APNs payload — 4 KB hard limit (Apple's, not AWS'). Our payloads are ~200 bytes including JSON wrapping.
- 10M endpoints per platform application. We're not going to hit this.

### Disaster recovery

If SNS in `us-east-2` has an outage, pushes back up in `PushQueue` (14-day retention) and resume when the region recovers. The DLQ catches anything that fails more than 3 times. This matches today's email DR posture.

## Security & privacy

- **Push tokens are PII-adjacent.** They're per-install identifiers and can be used to correlate device-to-user pairings. We treat them like email addresses: scoped to the logged-in user, not exposed via any tRPC query except `registerDevice` / `unregisterDevice`, dropped on user delete via the `users.id` cascade.
- **Apple App Privacy disclosure** needs updating. Push tokens, broadcast topic memberships, and analytics around delivery rates must be listed in the App Store nutrition labels. `PRIVACY-POLICY.md` in the repo root also needs an update to mention push as a delivery channel.
- **No third-party tracking in push payloads.** Don't include analytics query strings in `deepLink` that survive across users.
- **Permission prompt UX** must be gated behind explicit user action (the Notifications dialog toggle). Apple Review will reject auto-prompting on app launch.
- **Staging segregation.** Production endpoints live under the `APNS` ARN, TestFlight endpoints under `APNS_SANDBOX`. Misrouting between the two is a common bug; the `environment` column on `push_devices` prevents it.

## Effort estimate

Difficulty by surface. No calendar estimates.

| Surface | Complexity | Notes |
| --- | --- | --- |
| DB migration + types | Low | New table + 2 columns, formulaic Drizzle. |
| SST infra | Low | Copies the email-queue resources, adds two platform apps. |
| AANTS producer branch | Low–Medium | Read `push_devices`, branch fan-out, reuse existing helpers. |
| `PushProcessorLambda` | Medium | New Lambda; SNS publish + endpoint lifecycle handling. |
| iOS Swift refactor | Medium | ~50–100 lines across 3 files. Removes Firebase, wires native APNs. |
| Web frontend (native bridge + UI) | Medium | New JS↔Swift bridge code, opt-in UI in `NotificationsDialog.tsx`. |
| Apple Developer Console + SNS upload | Low (ops) | Bundle capability, provisioning profile, `.p8` upload. |
| Broadcast Lambda + cron | Low–Medium | Reuses `PushQueue`; idempotency table is the only new pattern. |
| Privacy policy + App Store labels | Low (content) | Real blocker for review. |
| Tests | Low–Medium | Mock SNS in vitest, unit-test the producer branch and processor. |

## Open questions

1. **Default state of `notifyByPush` for existing subscriptions.** Off (opt-in migration) or on (assume the user wants push if they have a device registered)? My instinct: default on, but only takes effect when a device is actually registered, so the user always has an action to opt in.
2. **Per-term broadcast opt-in vs. global.** "WebSOC opens for *Spring 2026*" is much more relevant if the user is planning Spring. Storing a term on the broadcast opt-in is a small additional column; worth it?
3. **Unsubscribe parity with email.** Email has unauthenticated unsubscribe links (used in `routes/UnsubscribePage.tsx`). Push has no equivalent public endpoint; the user manages preferences inside the app. Is that sufficient, or do we want a one-tap "stop all notifications" action from inside the push itself (a notification action button)?
4. **iOS Notification Service Extension.** Out of scope for v1, but if we ever want to mutate the payload on-device (e.g. localised body), we'll need a separate target in the Xcode project. Note for the future.
5. **Should we delete `push_devices` rows when SNS reports `EndpointDisabled`**, or keep them with `enabled=false`? Keeping them helps re-enable when the app re-registers. Deleting keeps the table small. Recommend keep + a periodic janitor that deletes rows with `lastSeenAt < now() - 180 days AND enabled=false`.
6. **Manual admin broadcast trigger.** Useful for one-off announcements ("schedule outage", "new feature"). Not v1, but worth keeping the shape in mind: a protected tRPC mutation that takes the same `PushRequest` shape and enqueues directly to `PushQueue`. No new infra.

## Risks

- **Apple App Review rejection.** Mitigated by gating the permission prompt behind a clear user action in the Notifications dialog, updating App Store Privacy nutrition labels, and shipping the bridge inside the existing PWABuilder shell architecture that's already been reviewed.
- **Stale `push_devices` rows.** Mitigated by `EndpointDisabled` handling at publish time, plus a periodic janitor.
- **APNs token rotation mismatch.** Mitigated by Apple's recommendation to re-register every app launch, and by `CreatePlatformEndpoint`'s idempotency on token.
- **SNS regional throughput in `us-east-2`.** Soft 9,000 msgs/sec — well above plausible AntAlmanac traffic, but worth verifying the actual quota on our account before launch.
- **Diverging from the PWABuilder-template push path.** The PWABuilder docs recommend FCM. We're going SNS-direct-to-APNs. This is a documented trade-off, but it does mean we own the Swift maintenance for the bridge going forward.
- **Future migration cost back to Firebase**, if SNS Mobile Push is ever sunset. Localised to `pushProcessor.ts` and the iOS Swift token-retrieval path. The data model, queue, producer logic, and JS bridge are unchanged.

## References

- AntAlmanac AANTS overview — `apps/aants/README.md`
- AANTS infra definition — `sst.config.ts` lines 20-140
- AANTS producer — `apps/aants/src/index.ts`, `apps/aants/src/helpers/notificationDispatch.ts`
- AANTS email consumer — `apps/aants/src/emailProcessor.ts`
- iOS push bridge (current) — `apps/pwa/src/AntAlmanac/PushNotifications.swift`, `apps/pwa/src/AntAlmanac/AppDelegate.swift`
- Web platform detection — `apps/antalmanac/src/lib/platform.ts`
- Subscription schema — `packages/db/src/schema/subscription.ts`
- User schema — `packages/db/src/schema/auth/user.ts`
- Term lifecycle data (`socAvailable`) — `apps/antalmanac/src/lib/termData.ts`, `apps/antalmanac/src/generated/termData.json`
- AWS SNS Mobile Push docs — https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-application-as-subscriber.html
- AWS SNS quotas — https://docs.aws.amazon.com/general/latest/gr/sns.html
- AWS SNS best practices for mobile push — https://docs.aws.amazon.com/sns/latest/dg/mobile-push-notifications-best-practices.html
- PWABuilder iOS push notifications guide — https://docs.pwabuilder.com/#/builder/app-store?id=push-notifications
