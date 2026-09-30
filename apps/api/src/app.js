const express = require("express");
const cors = require("cors");

const { loadConfig } = require("./config/env");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error");

/**
 * Builds the Express application.
 *
 * Kept separate from the server bootstrap so tests can mount the app without
 * opening a database connection or binding a port.
 */
function createApp() {
  const app = express();
  const { corsOrigins } = loadConfig();

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Parcel management server is running");
  });

  app.use("/api/v1", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
