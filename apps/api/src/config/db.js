const { MongoClient, ServerApiVersion } = require("mongodb");
const { loadConfig } = require("./env");

/**
 * Owns the single MongoClient for the process and hands out the collections
 * the rest of the app needs. Keeping this in one place means the connection is
 * opened once and never re-created per request.
 */

let client = null;
let db = null;

async function connect() {
  if (db) return db;

  const { mongoUri, databaseName } = loadConfig();

  client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(databaseName);

  // Confirm the deployment is really reachable before serving traffic.
  await db.admin().command({ ping: 1 });

  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connect() during startup.");
  }
  return db;
}

/**
 * The collections used across the API, resolved lazily so handlers can be
 * required without a live connection (which keeps them testable).
 */
function collections() {
  const database = getDb();
  return {
    users: database.collection("users"),
    bookings: database.collection("bookings"),
    reviews: database.collection("reviews"),
    payments: database.collection("payments"),
  };
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connect, getDb, collections, close };
