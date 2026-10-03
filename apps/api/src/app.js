const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const { loadConfig } = require("./config/env");
const routes = require("./routes");
const { getAuth } = require("./auth");
const { notFoundHandler, errorHandler } = require("./middleware/error");

/**
 * Builds the Express application.
 *
 * Kept separate from the server bootstrap so tests can mount the app without
 * opening a database connection or binding a port.
 *
 * Modern hardening applied by default:
 * - helmet security headers, compression, structured request logs
 * - strict CORS allow-list with credentials
 * - global rate limiting (relaxed automatically under NODE_ENV=test)
 * - versioned health endpoints for load-balancers and uptime monitors
 */
function createApp() {
  const app = express();
  const config = loadConfig();

  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  app.use(
    morgan(config.env === "production" ? "combined" : "dev", {
      skip: () => process.env.NODE_ENV === "test",
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  });
  app.use("/api/", limiter);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin / curl / health checks with no Origin header.
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["set-auth-token"],
    })
  );
  // Better Auth owns /api/auth/* (Express 5 splat syntax). It must sit after
  // CORS (so preflights pass) but before express.json: the handler reads the
  // raw body itself. The instance builds lazily because the Mongo adapter
  // needs a live connection.
  const { toNodeHandler } = require("better-auth/node");
  app.all("/api/auth/*splat", async (req, res) => {
    await toNodeHandler(getAuth())(req, res);
  });

  app.use(express.json({ limit: "1mb" }));

  app.get("/", (req, res) => {
    res.json({
      name: "parcel-management-api",
      status: "ok",
      version: "v1",
      docs: "/api/v1/health",
    });
  });

  const healthPayload = (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  };
  app.get("/health", healthPayload);
  app.get("/api/v1/health", healthPayload);

  app.use("/api/v1", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
