# History

This monorepo was assembled by merging the histories of two independent
repositories. Every original commit is preserved with its original author, date
and message.

## Provenance

| Archive                                  | Original remote                                                              | Commits |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ------- |
| `Parcel-Management-App.git`               | `https://github.com/Mehedihasan444/Parcel-Management-App.git`                | 20      |
| `Parcel-Management-App-Server.git`        | `https://github.com/Mehedihasan444/Parcel-Management-App-Server.git`         | 12      |

Both are archived as bare repositories at `../.parcel-archive/`. To work with one:

```bash
git clone ../.parcel-archive/Parcel-Management-App-Server.git /tmp/api-original
```

## How the monorepo was built

1. Both `.git` directories were mirrored to a bare backup first:
   `../.parcel-git-BACKUP-20260930-144542/`.

2. A new empty repository was created and given a single foundation commit.

3. Each history was grafted in with `git subtree`, so the original commits
   survive verbatim rather than being squashed into one import commit:

   ```bash
   git subtree add --prefix=apps/api ../.parcel-archive/Parcel-Management-App-Server.git main
   git subtree add --prefix=apps/web ../.parcel-archive/Parcel-Management-App.git        main
   ```

4. The merged history was then rewritten once with `git-filter-repo` to purge a
   hardcoded Firebase API key (see the security section below).

5. The Turborepo migration and the API modularisation were committed on top.

## Reference tags

| Tag                | Meaning                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `archive/api-head` | Last server commit. Unchanged — that history held no secrets.    |
| `archive/web-head` | Last web commit **after** the secret purge (hashes differ).      |
| `pre-monorepo`     | Point where both histories sat under `apps/`.                    |

Inspect the merged history:

```bash
git log --first-parent --oneline        # the structural commits
git log --full-history --oneline -- apps/api
git log --full-history --oneline -- apps/web
```

> `--full-history` is required: without it Git's path simplification hides the
> grafted history behind the subtree merge commits.

## Safety backups

| Path                                                     | What it is                                          |
| -------------------------------------------------------- | --------------------------------------------------- |
| `../.parcel-git-BACKUP-20260930-144542/`                 | Bare mirrors of both original `.git` directories    |
| `../.parcel-archive/`                                    | Long-term archive of both original repositories     |
| `../.parcel-worktree-STAGING-20260930-144542/`           | Copy of the two original working trees              |

## ⚠️ Security — rotate the Firebase API key

`Parcel-Management-App` committed a Firebase **Web API key** in
`src/Firebase/firebase.config.js`. The key has been removed from this
repository's history by `git-filter-repo` and replaced with a
`VITE_FIREBASE_API_KEY` environment read, but that only protects *this* copy.
The key is still present in:

- the archived repositories in `../.parcel-archive/`
- the backup in `../.parcel-git-BACKUP-20260930-144542/`
- the public GitHub repository

Before deploying:

1. **Rotate the key** in the
   [Google Cloud console](https://console.cloud.google.com/apis/credentials) —
   create a new key, restrict it to the Firebase Auth API and to your
   production domain, then delete the old one.
2. **Purge the GitHub history** and force-push:

   ```bash
   git clone --mirror https://github.com/Mehedihasan444/Parcel-Management-App.git web-mirror.git
   cd web-mirror.git
   git filter-repo --force --sensitive-data-removal \
     --replace-text ../parcel-management-system/scripts/filter-repo-replacements.txt
   git push --force --mirror origin
   ```

3. Set `VITE_FIREBASE_API_KEY` (and the other `VITE_FIREBASE_*` values) in the
   deployment environment from the rotated key.

Note that a Firebase *web* API key is designed to ship to browsers, so its
exposure is low severity on its own — the real risk is an unrestricted key
being used to burn quota or access other Google APIs. Domain and API
restrictions are the actual fix; the history purge is defence in depth.

## The `scripts/filter-repo-replacements.txt` format

This file is consumed by `git filter-repo --replace-text`, which has **no
comment syntax**. Every line is an expression, and the default replacement is
`***REMOVED***`. Adding a `#` comment line turns it into a rule that rewrites
every `#` in every blob to `***REMOVED***` — which corrupts shell scripts,
`.gitignore` and every other commented file. Keep the explanations in this
document, and the file itself to bare expressions.
