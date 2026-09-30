const { createApp } = require("./app");
const { loadConfig } = require("./config/env");
const { connect, close } = require("./config/db");

/**
 * Process entry point.
 *
 * The original server called `app.listen()` at module scope while the database
 * connection was still pending, so the API accepted traffic before it could
 * serve any query. This bootstrap connects first, then listens, and shuts the
 * connection down cleanly on SIGINT/SIGTERM.
 */
async function start() {
  const { port } = loadConfig();

  await connect();
  console.log("Connected to MongoDB");

  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Parcel management server is running on port: ${port}`);
  });

  const shutdown = (signal) => async () => {
    console.log(`\n${signal} received, shutting down`);
    server.close(async () => {
      await close();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown("SIGINT"));
  process.on("SIGTERM", shutdown("SIGTERM"));

  return server;
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
}

module.exports = { start };
