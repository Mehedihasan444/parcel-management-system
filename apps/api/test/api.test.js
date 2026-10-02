/**
 * API behaviour tests (no database required).
 *
 * Runs on Node's built-in test runner: `npm test --workspace=@parcel/api`.
 * Every case boots the real Express app on an ephemeral port and talks HTTP,
 * so middleware ordering (rate-limit → CORS → auth → validation) is exercised
 * exactly as deployed. Cases that need Mongo are left to the route-contract
 * probe, which asserts router reachability without a connection.
 */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");

process.env.DATABASE_LOCAL_USERNAME ||= "test-user";
process.env.DATABASE_LOCAL_PASSWORD ||= "test-password";
process.env.ACCESS_TOKEN_SECRET ||= "test-secret";
process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";

const { createApp } = require("../src/app");
const jwt = require("jsonwebtoken");

const tokenFor = (email) =>
  jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET || "test-secret", {
    expiresIn: "1h",
  });

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

async function req(method, path, { body, origin, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (origin) headers.Origin = origin;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON bodies are fine; callers check status only */
  }
  return { status: res.status, json, headers: res.headers };
}

describe("health and root", () => {
  it("GET /health reports ok with uptime", async () => {
    const { status, json } = await req("GET", "/health");
    assert.equal(status, 200);
    assert.equal(json.status, "ok");
    assert.equal(typeof json.uptime, "number");
    assert.ok(Date.parse(json.timestamp));
  });

  it("GET /api/v1/health mirrors /health", async () => {
    const { status, json } = await req("GET", "/api/v1/health");
    assert.equal(status, 200);
    assert.equal(json.status, "ok");
  });

  it("GET / describes the api", async () => {
    const { status, json } = await req("GET", "/");
    assert.equal(status, 200);
    assert.equal(json.name, "parcel-management-api");
    assert.equal(json.version, "v1");
  });

  it("rate-limit headers are emitted on /api routes", async () => {
    const { headers } = await req("GET", "/api/v1/health");
    // express-rate-limit draft-8 emits a single combined `RateLimit` header.
    assert.ok(headers.get("ratelimit"), "expected RateLimit header");
  });
});

describe("request validation", () => {
  it("POST /jwt rejects a body without email", async () => {
    const { status, json } = await req("POST", "/api/v1/jwt", { body: { probe: true } });
    assert.equal(status, 400);
    assert.equal(json.message, "Validation failed");
    assert.equal(json.errors[0].path, "email");
  });

  it("POST /users lists every missing field", async () => {
    const { status, json } = await req("POST", "/api/v1/users", { body: {} });
    assert.equal(status, 400);
    const paths = json.errors.map((e) => e.path).sort();
    assert.deepEqual(paths, ["email", "name"]);
  });

  it("POST /users rejects a malformed email", async () => {
    const { status, json } = await req("POST", "/api/v1/users", {
      body: { name: "A", email: "not-an-email" },
    });
    assert.equal(status, 400);
    assert.ok(json.errors.some((e) => e.path === "email"));
  });

  it("POST /create-payment-intent requires auth, then validates price", async () => {
    const anon = await req("POST", "/api/v1/create-payment-intent", { body: { price: 50 } });
    assert.equal(anon.status, 401);

    const token = tokenFor("buyer@example.com");
    for (const price of [-5, 0, "free"]) {
      const { status, json } = await req("POST", "/api/v1/create-payment-intent", {
        body: { price },
        token,
      });
      assert.equal(status, 400, `price=${price} should be rejected`);
      assert.equal(json.errors[0].path, "price");
    }
  });

  it("POST /payments requires auth and matching ownership", async () => {
    const anon = await req("POST", "/api/v1/payments", {
      body: { email: "a@b.co", price: 50, transactionId: "tx_1" },
    });
    assert.equal(anon.status, 401);

    const token = tokenFor("buyer@example.com");
    const { status, json } = await req("POST", "/api/v1/payments", {
      body: { email: "a@b.co" },
      token,
    });
    assert.equal(status, 400);
    assert.ok(json.errors.some((e) => e.path === "transactionId"));
  });
});

describe("auth runs before validation", () => {
  it("protected routes answer 401 even with a malformed id", async () => {
    const { status } = await req("PATCH", "/api/v1/users/bookings/assign/deliveryMen/not-an-id", {
      body: {},
    });
    assert.equal(status, 401);
  });
});

describe("CORS and 404", () => {
  it("rejects origins outside the allow-list", async () => {
    const { status } = await req("GET", "/api/v1/health", { origin: "https://evil.test" });
    assert.equal(status, 403);
  });

  it("unknown routes return the NOT_FOUND envelope", async () => {
    const { status, json } = await req("GET", "/api/v1/nope");
    assert.equal(status, 404);
    assert.equal(json.code, "NOT_FOUND");
  });
});
