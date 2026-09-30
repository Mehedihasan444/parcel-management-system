const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env") });

/**
 * Centralised, validated access to process.env.
 *
 * Nothing else in the codebase should read process.env directly, so that
 * missing configuration produces one clear startup error instead of a
 * confusing failure deep inside a request handler.
 */

const CLUSTER_HOST = "cluster0.6egtgqe.mongodb.net";
const DATABASE_NAME = "parcelManagementDB";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy apps/api/.env.example to apps/api/.env and fill it in.`
    );
  }
  return value;
}

/**
 * Validate and normalise configuration. Called once at startup so a bad
 * environment fails fast rather than on the first request that needs it.
 */
function loadConfig() {
  const port = Number(process.env.PORT) || 5000;

  return {
    port,
    env: process.env.NODE_ENV || "development",
    mongoUri: `mongodb+srv://${requireEnv("DATABASE_LOCAL_USERNAME")}:${requireEnv(
      "DATABASE_LOCAL_PASSWORD"
    )}@${CLUSTER_HOST}/?retryWrites=true&w=majority`,
    databaseName: DATABASE_NAME,
    accessTokenSecret: requireEnv("ACCESS_TOKEN_SECRET"),
    stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
    // The original server hardcoded a single dev origin. Keep that default
    // but allow extra origins (comma separated) for other environments.
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}

module.exports = { loadConfig, CLUSTER_HOST, DATABASE_NAME };
