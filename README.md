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

| Layer | Technology                                                                     |
| ----- | ------------------------------------------------------------------------------ |
| `web` | React 19, Vite 7, React Router 7, TanStack Query 5, Tailwind CSS 4 + daisyUI 5 |
| `api` | Express 5, MongoDB driver 6, JWT, Stripe 17, helmet + rate-limit + zod         |
| Repo  | npm workspaces, Turborepo 2, Prettier 3                                        |

Highlights: dark/light themes, glass sticky navbar, CSS-mesh hero with live-shipment
card, code-split charts/maps/Stripe chunks, role-guarded dashboard, health-checked API.

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

| Command                | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Runs both apps together                           |
| `npm run dev:web`      | Runs only the web app                             |
| `npm run dev:api`      | Runs only the API                                 |
| `npm run build`        | Builds every app                                  |
| `npm run test`         | Route contract test (see below)                   |
| `npm run lint`         | Lints every app                                   |
| `npm run format`       | Prettier-write the repo                           |
| `npm run format:check` | Fails on unformatted files (CI)                   |
| `npm run check`        | Import resolution, docs, and secret audit         |
| `npm run clean`        | Removes build output and `node_modules`           |
| `npm run api:contract` | Prints the API endpoints the web app depends on   |
| `npm run graph`        | Writes a task-graph visualisation to `graph.html` |

## Layout

```
apps/
  api/
    src/
      config/       env validation and the single MongoClient
      middleware/   auth guards, zod validate, 404, central error handler
      modules/      one folder per feature, each with routes + service
      utils/        asyncHandler, ObjectId parsing, response helpers
      routes/       mounts every feature router
      app.js        Express 5 assembly: helmet, CORS allow-list, rate-limit, health
      server.js     bootstrap: connect, then listen
    scripts/
      route-contract.test.js   asserts the public API has not drifted
      smoke.js                 boots the app and exercises live routes
  web/
    src/
      config/       runtime config read from Vite env vars
      Components/   Seo (DocumentTitle, ThemeToggle), Shared, SectionTitle, charts
      Pages/        route-level screens (Home lazy-splits Admin/Stripe/Map)
      Hooks/        auth, singleton axios, role guards
      Firebase/     Firebase Auth initialisation
      Layouts/      Main (site) + Dashboard (role sidebar)
    scripts/
      lint.js       lints with a problem-count budget (currently 47)
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
src/routes/index.js
   |
   +-- modules/auth/      POST /jwt
   +-- modules/users/     /users, /users/admin, /users/:email
   +-- modules/bookings/  /users/bookings/..., /users/booking/:id
   +-- modules/delivery/  /deliveryMen/..., /users/admin/deliveryMens
   +-- modules/admin/     /admin/:email, /admin/users/collection
   +-- modules/payments/  /create-payment-intent, /payments
```

Each module owns its route table and its service, and receives the Mongo
collections through `config/db.js` rather than opening its own connection.

Hardening: `helmet` headers, `compression`, strict CORS allow-list,
`express-rate-limit` (300/15min, relaxed in test), `GET /health` +
`GET /api/v1/health`, JSON `{message,code,detail}` errors, `MONGODB_URI`
override + `DATABASE_NAME` + `TRUST_PROXY` support.

**Mount order is load-bearing.** Several paths overlap — `GET /users/admin`
sits next to `GET /users/:email` — so routers declare literal segments before
parameter segments. `apps/api/scripts/route-contract.test.js` boots the app and
probes all 29 routes over real HTTP, so a renamed, dropped or shadowed route
fails the build instead of breaking the client at runtime.

## Environment

Copy the templates and fill them in. Real `.env` files are gitignored and must
never be committed.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### `apps/api`

| Variable                  | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `PORT`                    | API port (default `5000`)                          |
| `MONGODB_URI`             | Full Mongo URI (preferred; overrides split pair)   |
| `DATABASE_LOCAL_USERNAME` | MongoDB Atlas username (legacy split style)        |
| `DATABASE_LOCAL_PASSWORD` | MongoDB Atlas password (legacy split style)        |
| `DATABASE_NAME`           | DB name (default `parcelManagementDB`)             |
| `ACCESS_TOKEN_SECRET`     | JWT signing secret for access tokens               |
| `STRIPE_SECRET_KEY`       | Stripe secret key for payment intents              |
| `CORS_ORIGINS`            | Comma-separated allowed origins                    |
| `TRUST_PROXY`             | Set `1` behind Render/Fly/Nginx for real-IP limits |

Missing values fail fast at startup with a message naming the variable, rather
than surfacing as a confusing error on the first request.

### `apps/web`

| Variable            | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `VITE_API_BASE_URL` | API base URL (default `http://localhost:5000/api/v1`) |
| `VITE_FIREBASE_*`   | Firebase Auth configuration                           |

## Quality gates

| Check             | Command                     | Notes                                         |
| ----------------- | --------------------------- | --------------------------------------------- |
| Format            | `npm run format:check`      | Prettier 3; CI fails on drift                 |
| Route contract    | `npm run test`              | 29 routes probed over HTTP; fails on drift    |
| Lint              | `npm run lint`              | Budget-based (47); see below                  |
| Import resolution | `npm run check:imports`     | Catches case-mismatched paths                 |
| Documentation     | `npm run check:docs`        | Verifies links, commands, paths and tags      |
| Secret audit      | `npm run audit:secrets`     | Scans all history; non-zero exit on a finding |
| All of the above  | `npm run check && npm test` | What CI runs (plus format + build)            |

The web app inherited 60 lint problems from the original repository. Successive
modernizations (prop-types, guard rewrites, premium UI) reduced it to **47**.
`apps/web/scripts/lint.js` treats 47 as a budget: it passes until the count grows,
so new problems still fail the build.
`npm run lint:strict --workspace=@parcel/web` reports every problem.

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

> **Security note.** A Firebase API key was committed in the original client
> repository. It has been removed from this repository's history and moved to
> `VITE_FIREBASE_API_KEY`, but it is still present in the archives and on the
> original GitHub repositories. **Rotate it** and purge those histories before
> deploying. See the security section of [`docs/HISTORY.md`](docs/HISTORY.md).

## License

[ISC](LICENSE) © Mehedi Hasan
