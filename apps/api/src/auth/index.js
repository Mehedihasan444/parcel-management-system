const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const { bearer } = require("better-auth/plugins");
const { getDb } = require("../config/db");
const { loadConfig } = require("../config/env");

/**
 * Better Auth instance (email/password + Google, Bearer sessions, MongoDB).
 *
 * Built lazily on first use: the Mongo adapter needs a connected Db, which is
 * only available after bootstrap `connect()` runs. Tests that boot the app
 * without a database get a clear throw (surfaced as 500) instead of a crash
 * at require time. Unauthenticated requests never reach this module — the
 * 401 path in middleware/auth.js fires first.
 */

let cached = null;

function getAuth() {
  if (cached) return cached;

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Missing or weak BETTER_AUTH_SECRET (min 32 chars). " +
        "Copy apps/api/.env.example to apps/api/.env — generate one with: " +
        "node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
  }

  const { corsOrigins } = loadConfig();
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  cached = betterAuth({
    appName: "RapidParcelHub",
    baseURL:
      process.env.BETTER_AUTH_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL.trim()}`
          : "http://localhost:5000"),
    secret,
    database: mongodbAdapter(getDb()),
    emailAndPassword: { enabled: true },
    // Google is optional: local email auth always works; the client shows the
    // Google button regardless and surfaces a clear error when unconfigured.
    ...(googleClientId && googleClientSecret
      ? {
          socialProviders: {
            google: { clientId: googleClientId, clientSecret: googleClientSecret },
          },
        }
      : {}),
    // Bearer tokens (localStorage `access-token`, same as the old JWT flow)
    // authenticate API calls; cookies remain a fallback (OAuth logins).
    plugins: [bearer()],
    trustedOrigins: corsOrigins,
  });

  return cached;
}

module.exports = { getAuth };
