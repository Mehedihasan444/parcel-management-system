# Parcel Management System

[![CI](https://github.com/Mehedihasan444/parcel-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Mehedihasan444/parcel-management-system/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A modern parcel/courier management platform in a single Turborepo monorepo:
a premium React client and a hardened Express + MongoDB API.

| App   | Path       | Original remote                                                                                  |
| ----- | ---------- | ------------------------------------------------------------------------------------------------ |
| `web` | `apps/web` | [`Parcel-Management-App`](https://github.com/Mehedihasan444/Parcel-Management-App)               |
| `api` | `apps/api` | [`Parcel-Management-App-Server`](https://github.com/Mehedihasan444/Parcel-Management-App-Server) |

## Stack

| Layer | Technology                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| `web` | React 19, Vite 8, Router 7, Query 5, Tailwind 4 + daisyUI 5, TS strict (lib/hooks/guards/config; pages next) |
| `api` | Express 5, MongoDB 7, Better Auth 1.7 (Bearer sessions), Stripe 23, helmet + rate-limit + zod 4              |
| Repo  | npm workspaces, Turborepo 2, Prettier 3                                                                      |

Highlights: dark/light themes, glass sticky navbar, CSS-mesh hero with live-shipment
card, code-split charts/maps/Stripe chunks, role-guarded dashboard, installable PWA,
health-checked API with zod validation and DB-checked authorization on every route,
Better Auth email/password (+ optional Google) with Bearer-token API sessions.

## Getting started

Requires Node.js 20+ (22 recommended, see `.nvmrc`).

```bash
npm install     # installs every workspace
npm run dev     # runs web and api together
```

Run a single app:

```bash
npm run dev --workspace=@parcel/web    # client on http://localhost:5173
npm run dev --workspace=@parcel/api    # api on http://localhost:5000
```

### All tasks

| Command                                     | What it does                                      |
| ------------------------------------------- | ------------------------------------------------- |
| `npm run dev`                               | Runs both apps together                           |
| `npm run dev:web`                           | Runs only the web app                             |
| `npm run dev:api`                           | Runs only the API                                 |
| `npm run build`                             | Builds every app                                  |
| `npm run test`                              | API + web test suites (see below)                 |
| `npm run typecheck --workspace=@parcel/web` | Strict `tsc --noEmit` (lib/hooks/guards/config)   |
| `npm run lint`                              | Lints every app                                   |
| `npm run format`                            | Prettier-write the repo                           |
| `npm run format:check`                      | Fails on unformatted files (CI)                   |
| `npm run check`                             | Import resolution, docs, and secret audit         |
| `npm run clean`                             | Removes build output and `node_modules`           |
| `npm run api:contract`                      | Prints the API endpoints the web app depends on   |
| `npm run graph`                             | Writes a task-graph visualisation to `graph.html` |

## Layout

```
apps/
  api/
    src/
      config/       env validation and the single MongoClient
      auth/         Better Auth instance (Mongo adapter, bearer, email+Google)
      middleware/   session auth, ownership/role guards, zod validate, 404/errors
      modules/      one folder per feature, each with routes + service
      utils/        asyncHandler, ObjectId parsing, response helpers
      routes/       mounts every feature router
      app.js        Express 5 assembly: helmet, CORS allow-list, rate-limit, health
      server.js     bootstrap: connect, then listen
    scripts/
      route-contract.test.js   asserts the public API has not drifted
      smoke.js                 boots the app and exercises live routes
    test/
      api.test.js              health, validation, CORS, 404 over real HTTP
      authz.test.js            23 forbidden-vs-ok cases on in-memory Mongo
  web/
    src/
      config/       runtime config read from Vite env vars
      Components/   Seo (DocumentTitle, ThemeToggle), Shared, SectionTitle, charts
      Pages/        route-level screens (Home lazy-splits Admin/Stripe/Map)
      Hooks/        typed auth/axios/role hooks (singleton interceptors)
      AuthProvider/ Better Auth session provider + typed context
      Layouts/      Main (site) + Dashboard (role sidebar)
      lib/          auth-client/notify/confirm/pricing (typed, unit-tested)
    test/           Vitest suite: pricing, confirm dialog, notify facade
    scripts/
      lint.js       zero-tolerance ESLint 10 (flat config)
docs/
  HISTORY.md        provenance, reference tags, recovery notes
scripts/
  audit-secrets.sh          scans every blob in history for credentials
  check-docs.js             verifies documented links, commands, paths and tags
  check-imports.js          verifies every relative import resolves
  extract-api-contract.js   lists the API endpoints the web app uses
  filter-repo-replacements.txt  expressions used to purge secrets
```

## API architecture

The server was originally a single 443-line `index.js`. It is now split by
feature, so a change to one area does not require reading the whole server:

```
Authentication lives in Better Auth at /api/auth/* (email/password +
optional Google, Bearer-token API sessions). The old POST /jwt route is gone.

src/routes/index.js
   |
   +-- modules/users/     /users, /users/admin, /users/:email
   +-- modules/bookings/  /users/bookings/..., /users/booking/:id
   +-- modules/delivery/  /deliveryMen/..., /users/admin/deliveryMens
   +-- modules/admin/     /admin/:email, /admin/users/collection
   +-- modules/payments/  /create-payment-intent, /payments
   +-- modules/uploads/   /uploads/image (Multer + Cloudinary)
```

Each module owns its route table and its service, and receives the Mongo
collections through `config/db.js` rather than opening its own connection.

Hardening: `helmet` headers, `compression`, strict CORS allow-list,
`express-rate-limit` (300/15min, relaxed in test), `GET /health` +
`GET /api/v1/health`, JSON `{message,code,detail}` errors, `MONGODB_URI`
override + `DATABASE_NAME` + `TRUST_PROXY` support. Every write route validates
with zod (`middleware/schemas.js`) — garbage gets a 400 with field-level errors
before it can reach Stripe or Mongo.

**Mount order is load-bearing.** Several paths overlap — `GET /users/admin`
sits next to `GET /users/:email` — so routers declare literal segments before
parameter segments. `apps/api/scripts/route-contract.test.js` boots the app and
probes all 29 routes over real HTTP, so a renamed, dropped or shadowed route
fails the build instead of breaking the client at runtime.

Image uploads (`POST /uploads/image`) accept a single multipart `image` field
(max 5 MB, JPEG/PNG/WebP/GIF/AVIF), held in memory by Multer and streamed to
Cloudinary (1024px cap, auto quality/format). My Profile posts there and saves
the returned `url` on the user document — no client-side hosting key needed.

## Environment

Copy the templates and fill them in. Real `.env` files are gitignored and must
never be committed.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### `apps/api`

| Variable                  | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `PORT`                    | API port (default `5000`)                                   |
| `MONGODB_URI`             | Full Mongo URI (preferred; overrides split pair)            |
| `DATABASE_LOCAL_USERNAME` | MongoDB Atlas username (legacy split style)                 |
| `DATABASE_LOCAL_PASSWORD` | MongoDB Atlas password (legacy split style)                 |
| `DATABASE_NAME`           | DB name (default `parcelManagementDB`)                      |
| `BETTER_AUTH_SECRET`      | Session/token secret, min 32 chars (see below)              |
| `BETTER_AUTH_URL`         | Public origin of this API, e.g. dev `http://localhost:5000` |
| `GOOGLE_CLIENT_ID`        | Google OAuth client id (optional; email auth always works)  |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth secret (optional)                              |
| `STRIPE_SECRET_KEY`       | Stripe secret key for payment intents                       |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name for image uploads                     |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                                          |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                                       |
| `CORS_ORIGINS`            | Comma-separated allowed origins                             |
| `TRUST_PROXY`             | Set `1` behind Render/Fly/Nginx for real-IP limits          |

Without the `CLOUDINARY_*` trio the API still boots, but `POST /uploads/image`
answers 503 naming the missing vars.

Missing values fail fast at startup with a message naming the variable, rather
than surfacing as a confusing error on the first request.

### `apps/web`

| Variable                  | Purpose                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`       | API base URL (default `http://localhost:5000/api/v1`)                        |
| `VITE_PAYMENT_GATEWAY_PK` | Stripe publishable key for Payments page (optional, shows notice if missing) |

Profile photos upload through the API (`POST /uploads/image`, Multer +
Cloudinary), so the client needs no image-hosting key.

## Authorization

Every API route authenticates with a Better Auth session (Bearer `access-token`,
cookies as fallback), then authorizes — the dashboard's role screens are cosmetic
and the server never trusts client-supplied identity:

| Rule                                        | Enforced by                                                    |
| ------------------------------------------- | -------------------------------------------------------------- |
| Admin roster, feeds, assignment, role edits | `verifyAdmin` (DB-checked role)                                |
| Own profile, bookings, payments             | ownership guards re-checked against Mongo                      |
| Rider delivery transitions                  | assignee match on `deliveryMenID`, else admin                  |
| Signup                                      | `role` forced to `"user"` server-side; promotion is admin-only |

`apps/api/test/authz.test.js` proves the matrix (23 cases, all on real
sign-up/sign-in sessions) on in-memory Mongo.

## Quality gates

| Check             | Command                     | Notes                                         |
| ----------------- | --------------------------- | --------------------------------------------- |
| Format            | `npm run format:check`      | Prettier 3; CI fails on drift                 |
| Typecheck         | `turbo run typecheck`       | Strict TS: lib, hooks, guards, config         |
| API behaviour     | `npm run test`              | 11 node:test cases: health, validation, CORS  |
| API auth matrix   | `npm run test`              | 23 cases on real Better Auth sessions         |
| API uploads       | `npm run test`              | 5 cases: auth, type, size, presence, 503      |
| Route contract    | `npm run test`              | 29 routes probed over HTTP; fails on drift    |
| Web unit tests    | `npm run test`              | 9 Vitest cases: pricing, confirm, notify      |
| Lint              | `npm run lint`              | Zero-tolerance; see below                     |
| Import resolution | `npm run check:imports`     | Catches case-mismatched paths                 |
| Documentation     | `npm run check:docs`        | Verifies links, commands, paths and tags      |
| Secret audit      | `npm run audit:secrets`     | Scans all history; non-zero exit on a finding |
| All of the above  | `npm run check && npm test` | What CI runs (plus format + build)            |

The web app inherited 60 lint problems from the original repository. Successive
modernizations paid them all off: `apps/web/scripts/lint.js` now enforces
zero tolerance on ESLint 10 (flat config) — any problem fails the build.
`npm run lint:fix --workspace=@parcel/web` auto-fixes what ESLint can.

## History

Both original histories are preserved — every commit keeps its original author,
date and message. This repository was assembled by grafting both projects with
`git subtree`, so the original commits survive rather than being squashed into
a single import commit.

| Tag                | Meaning                                         |
| ------------------ | ----------------------------------------------- |
| `archive/api-head` | Last server commit (original hash, unchanged)   |
| `archive/web-head` | Last client commit, after the secret purge      |
| `pre-monorepo`     | Point at which both histories sat under `apps/` |

See [`docs/HISTORY.md`](docs/HISTORY.md) for the full provenance table, how the
merge was performed, and recovery instructions.

> **Security note.** Firebase is gone — auth is now Better Auth (email/password
> plus optional Google) with secrets in `BETTER_AUTH_SECRET`, so no Firebase key
> rotation is needed for this app. The original client repositories still contain
> their old Firebase key in their own histories; rotate it there if those apps
> are ever deployed. See [`docs/HISTORY.md`](docs/HISTORY.md) for provenance.

## License

[ISC](LICENSE) © Mehedi Hasan
