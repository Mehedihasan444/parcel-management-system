# Parcel Management System

Turborepo monorepo for the parcel/courier management platform: a React web app
and an Express + MongoDB API, each carrying the full history of its original
repository.

| App   | Path       | Original remote                                                     |
| ----- | ---------- | ------------------------------------------------------------------- |
| `web` | `apps/web` | `https://github.com/Mehedihasan444/Parcel-Management-App.git`        |
| `api` | `apps/api` | `https://github.com/Mehedihasan444/Parcel-Management-App-Server.git` |

## Layout

```
apps/
  web/   React 18 + Vite + Tailwind + daisyUI client
  api/   Express 4 + MongoDB driver server (modular)
scripts/
  audit-secrets.sh          scans every blob in history for credentials
  extract-api-contract.js   lists the API contract the web app depends on
  filter-repo-replacements.txt  expressions used to purge secrets from history
docs/
  HISTORY.md                provenance, reference tags and recovery notes
```

## Getting started

```bash
npm install          # installs every workspace
npm run dev          # runs web + api together
npm run build        # builds all apps
npm run lint         # lints all apps
```

Run a single app:

```bash
npm run dev --workspace=@parcel/web
npm run dev --workspace=@parcel/api
```

## Environment

`apps/api` reads its configuration from environment variables. Copy the template
and fill it in — never commit a real `.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable                  | Purpose                               |
| ------------------------- | ------------------------------------- |
| `PORT`                    | API port (default `5000`)             |
| `DATABASE_LOCAL_USERNAME` | MongoDB Atlas username                |
| `DATABASE_LOCAL_PASSWORD` | MongoDB Atlas password                |
| `ACCESS_TOKEN_SECRET`     | JWT signing secret for access tokens  |
| `STRIPE_SECRET_KEY`       | Stripe secret key for payment intents |

The web app reads `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api/v1`)
and the `VITE_FIREBASE_*` values used by Firebase Auth.

## History

Both original histories are preserved — every commit keeps its author, date and
message. See [`docs/HISTORY.md`](docs/HISTORY.md) for the provenance table, the
reference tags, and the archived original repositories.
