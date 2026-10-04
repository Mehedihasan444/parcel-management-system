const { createApp } = require("../apps/api/src/app");
const { connect } = require("../apps/api/src/config/db");

/**
 * Vercel serverless entry point for the Express API.
 *
 * `vercel.json` rewrites every `/api/*` request here, while the Vite build in
 * `apps/web/dist` serves everything else. The Express app is created once per
 * warm function instance and the MongoDB connection is reused across
 * invocations (cold starts connect lazily on the first request instead of at
 * `app.listen()` time, which serverless does not support).
 */

let cachedApp = null;
let connecting = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  if (!connecting) {
    connecting = connect().catch((err) => {
      connecting = null;
      throw err;
    });
  }
  await connecting;
  cachedApp = createApp();
  return cachedApp;
}

module.exports = async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("API cold-start failed:", err.message);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: "API failed to start", error: err.message }));
  }
};
