# Contributing

Thanks for helping improve the Parcel Management System.

## Getting set up

Requires Node.js 20 or newer.

```bash
npm install
cp apps/api/.env.example apps/api/.env    # fill in the values
cp apps/web/.env.example apps/web/.env
npm run dev
```

The client runs on <http://localhost:5173> and the API on
<http://localhost:5000>.

## Before you push

```bash
npm run build        # every app builds
npm run test         # the API route contract has not drifted
npm run lint         # no new lint problems
npm run audit:secrets
```

All four run in CI, so a failure there will block the pull request.

## The two rules that matter most

**1. Do not change the public API without updating the contract test.**

`apps/api/scripts/route-contract.test.js` lists every route the original server
exposed and asserts the app still matches it. If you add, rename or remove a
route, update `EXPECTED_ROUTES` in that file in the same commit and say why in
the pull request. The web client is deployed independently of the API, so a
silent route change breaks it.

Several routes overlap (`GET /users/admin` next to `GET /users/:email`), so
**declaration order decides which handler runs**. Literal segments must be
declared before parameter segments, and the mount order in
`src/routes/index.js` matters. Reordering either is a breaking change.

**2. Never commit secrets.**

Real `.env` files are gitignored. Use the `.env.example` templates. If you
accidentally commit a credential, remove it from the working tree _and_ rotate
it — deleting the commit is not enough once it has been pushed. Tell a
maintainer so the history can be rewritten with `git filter-repo`.

## Conventions

- Match the style of the file you are editing. This codebase has no formatter
  configured; do not reformat unrelated lines.
- Keep controllers thin. Route handlers in `src/modules/*/*.service.js` should
  describe intent and delegate; anything reusable belongs in `src/utils/`.
- Use `asyncHandler` for any async route handler, so rejected promises reach
  the error handler instead of leaving the request hanging.
- Prefer `toObjectId` from `src/utils/ids.js` over `new ObjectId(id)` — it
  rejects malformed ids with a 400 instead of a BSON error.

## Commits and pull requests

Write commit messages in the imperative mood and explain the reasoning when it
is not obvious. A pull request should say what changed, why, and how it was
verified.
