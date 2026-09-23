# Feedants Competition Details

## Overview

This repository implements the Feedants Competition Details assignment as a functional full-stack module. The Expo React Native client renders a mobile competition page from MongoDB-backed API data, while the Express API owns lifecycle decisions, availability, registration, and submission eligibility.

## Tech Stack

- React Native with Expo and TypeScript
- Node.js and Express 5
- MongoDB with Mongoose
- Node's built-in test runner

## Features

- Dynamic competition, judge, dates, winners, content tabs, rewards, payment/refund, referral, and feedback data
- Date-derived competition lifecycle and a one-second registration countdown
- Backend-authoritative registration, remaining capacity, user state, and submission state
- Working registration and URL-based demo submission flows
- Unique-index capacity protection and duplicate-registration prevention
- Horizontal winners carousel, expandable content, functional tabs, clipboard copy, native share, and video links
- Loading, retry, empty, full, upcoming, closed, registered, submission-open, and submitted states
- Responsive card layout, fixed primary action, and bottom navigation
- Visual ENG/Hindi toggle; organizer-authored database content remains in its stored language

## Architecture

```text
frontend/
  src/components/    reusable UI sections and action states
  src/hooks/         server-data orchestration
  src/screens/       competition details composition
  src/services/      typed API access
backend/
  src/controllers/   HTTP request/response handling
  src/services/      lifecycle, registration, and submission rules
  src/models/        MongoDB schemas and indexes
  src/routes/        REST routes and validation
  src/middleware/    validation and consistent errors
  scripts/seed.js    repeatable demo data
  test/              lifecycle and concurrency-focused tests
```

The frontend does not contain competition records. It renders the response from the API and refreshes state after every mutation and when the countdown reaches zero.

## API Endpoints

All successful responses use `{ "data": ... }`. Errors use `{ "error": { "code", "message", "details?" } }`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Process and database-independent health response |
| GET | `/api/competitions/:id?userId=:userId` | Full screen payload, calculated availability, lifecycle, and user state |
| GET | `/api/competitions/:id/state?userId=:userId` | Compact calculated state |
| GET | `/api/competitions/:id/winners` | Previous winners |
| GET | `/api/competitions/:id/rewards` | Reward positions |
| GET | `/api/competitions/:id/content` | About, judging parameters, rules, and eligibility |
| POST | `/api/competitions/:id/register` | Register with `{ "userId": "..." }` |
| POST | `/api/competitions/:id/submission` | Submit `{ "userId", "title", "mediaUrl" }` |

The `:id` parameter accepts either a MongoDB ObjectId or the seeded slug `classical-dance`.

## Database Models

- **Competition** stores public content, capacity, all lifecycle timestamps, judge, winners, tabs, rewards, referral, reviews, and payment/refund copy.
- **User** stores the demo identity. Authentication is intentionally represented by a configured user ID for this assignment.
- **Participation** references a user and competition, records payment/registration/submission state, and owns a capacity slot.
- **Submission** stores one validated public media URL and title per user/competition.

Indexes include unique email and competition slug indexes, a unique `(competitionId, userId)` participation index, a unique `(competitionId, slotNumber)` capacity index, and a unique submission index.

## Concurrency Strategy

Capacity is modeled as integer slots `0..maxParticipants-1`. Registration attempts insert one slot into `Participation`. MongoDB's unique `(competitionId, slotNumber)` index makes a slot claim atomic, while the unique `(competitionId, userId)` index prevents the same user claiming another slot. On a slot collision the service tries another valid slot; after all slots collide it reports `COMPETITION_FULL`.

This avoids an unsafe read-check-increment counter and cannot exceed capacity, even with concurrent API processes. Availability is counted from indexed registered participation records, so there is no denormalized counter to drift or compensate. The included test submits 20 concurrent registration attempts to a three-slot competition and asserts exactly three succeed.

For competitions with very large capacities, production could replace the bounded slot probe with a transaction-backed allocation collection or a partitioned allocator. The current strategy is intentionally simple and strong for competition-sized capacities.

## Competition Lifecycle

The backend derives lifecycle from ISO timestamps:

- before `registrationStart`: `UPCOMING`
- within registration: `REGISTRATION_OPEN`
- between registration and submission: `REGISTRATION_CLOSED`
- within submission: `SUBMISSION_OPEN`
- after submission and before results: `RESULTS_PENDING`
- at/after results: `COMPLETED`

Registration and submission eligibility are separate time-window flags because the reference dates allow the windows to overlap. The countdown is presentation only; every mutation is checked again against server time.

## Setup

Requirements: Node.js 22.13+, npm, Docker (recommended) or a local MongoDB 7/8 instance.

1. Copy `.env.example` to `backend/.env`.
2. Copy `.env.example` to `frontend/.env` and keep the three `EXPO_PUBLIC_*` variables. On a physical phone, replace `10.0.2.2` with the computer's LAN IP. For iOS Simulator, use `localhost`.
3. Start MongoDB:

   ```bash
   docker compose up -d mongodb
   ```

4. Install both projects:

   ```bash
   npm run install:all
   ```

5. Seed/reset the demo records:

   ```bash
   npm run seed
   ```

## Running Backend

```bash
npm run dev:backend
```

The API runs at `http://localhost:4000` by default.

## Running Frontend

```bash
npm run dev:frontend
```

From Expo, press `a` for an Android emulator, `i` for iOS on macOS, or scan the QR code with Expo Go. The seeded demo user begins unregistered; register to see the UI switch to the upload action, then submit a public video URL.

## Environment Variables

| Variable | Used by | Description |
| --- | --- | --- |
| `PORT` | backend | Express port |
| `MONGODB_URI` | backend | MongoDB connection string |
| `CORS_ORIGIN` | backend | `*` for development or comma-separated allowed origins |
| `NODE_ENV` | backend | `development`, `test`, or `production` |
| `EXPO_PUBLIC_API_BASE_URL` | frontend | Device-accessible API URL ending in `/api` |
| `EXPO_PUBLIC_COMPETITION_ID` | frontend | Seeded competition ID |
| `EXPO_PUBLIC_DEMO_USER_ID` | frontend | Seeded development user |

No secrets are committed.

## Database Seeding

`npm run seed` is idempotent for the fixed demo IDs. Dates are generated relative to seed time so registration and submission actions can be demonstrated instead of immediately appearing completed. It creates one existing participant, leaving the configured demo user free to register; initial availability is therefore 1/20.

## Testing

```bash
npm test
npm run check
```

Tests cover lifecycle boundaries, overlapping eligibility windows, valid and duplicate registration, closed registration, concurrent capacity, registration-required submission, closed submission, and valid submission. `npm run check` also parses critical backend entry points and runs the frontend TypeScript compiler.

## Assumptions

- Authentication is outside scope. A fixed seeded user ID is passed to the API; production must derive it from verified authentication, never a request body.
- Payment is represented honestly as `DEMO_PAID`; no Razorpay charge is initiated. The UI only identifies the provider from database content.
- Submission stores a validated public HTTP(S) media URL instead of uploading binary media to cloud storage.
- The language toggle demonstrates localizable application chrome. Full translation of organizer-authored content requires translated fields or a localization service.
- Remote demo photos and video links are replaceable content references, not bundled production assets.

## Technical Decisions

- A single full-details request populates the screen to avoid avoidable mobile round trips. Smaller content endpoints are also available for API completeness and other consumers.
- Availability is derived from participation records, avoiding counter drift.
- Zod validates mutation bodies and Mongoose validates persistent structures.
- Server errors have stable codes while the client displays safe messages.
- Relative seed dates make the functional flow reproducible at evaluation time.

## Trade-offs

- Unique slot probing favors operational simplicity over optimal allocation at extremely high occupancy for very large capacities.
- The demo has one configured user instead of an authentication flow.
- Public URL submission avoids cloud credentials and large multipart upload infrastructure.
- Remote images require network access; production should use owned, optimized CDN assets.

## Production Improvements

- Add authenticated user sessions, authorization, rate limiting, structured logs, tracing, and audit records.
- Integrate verified Razorpay webhooks and idempotency keys before marking payment paid.
- Add signed object-storage uploads, media scanning/transcoding, and moderation.
- Add translated content fields, accessibility testing, analytics, offline caching, and push notifications.
- Run API integration tests against ephemeral MongoDB in CI, add load tests, and monitor slot collision rates.
- Paginate large winners/reviews lists and introduce caching/read replicas when traffic warrants it.
