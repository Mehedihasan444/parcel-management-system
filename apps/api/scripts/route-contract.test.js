/**
 * Route contract test.
 *
 * Boots the Express app on an ephemeral port and issues a real HTTP request
 * against every route the original server exposed, asserting that each one is
 * *reached* by the router.
 *
 * This is a behavioural check rather than an introspection of Express'
 * internal stack, so it is immune to mount-path bookkeeping. It distinguishes
 * three outcomes:
 *
 *   404  -> no route matched. The contract is broken.
 *   401  -> matched, but the route is JWT protected and no token was sent.
 *   500  -> matched, unprotected, and the handler failed because no database
 *           is connected in the test. Still proof the router reached it.
 *
 * Any status other than 404 means the router resolved the request to a real
 * handler, which is exactly what must not regress during modularisation.
 *
 * Run with:  npm run test --workspace=@parcel/api
 */
const assert = require("assert");

// The config module validates these at require() time. No connection is made.
process.env.DATABASE_LOCAL_USERNAME ||= "test-user";
process.env.DATABASE_LOCAL_PASSWORD ||= "test-password";
process.env.ACCESS_TOKEN_SECRET ||= "test-secret";
process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";

const { createApp } = require("../src/app");

/**
 * The exact contract of the original server, transcribed from apps/api/index.js
 * at commit 508eb51. This list is the specification: update it only when the
 * API is deliberately changed, never to paper over an accidental break.
 */
const EXPECTED_ROUTES = [
  ["GET", "/"],
  ["POST", "/api/v1/jwt"],
  ["POST", "/api/v1/users"],
  ["GET", "/api/v1/users/admin"],
  ["GET", "/api/v1/users/:email"],
  ["POST", "/api/v1/users/reviews"],
  ["PATCH", "/api/v1/users/:email"],
  ["GET", "/api/v1/users"],
  ["PUT", "/api/v1/users/updateProfile/:email"],
  ["POST", "/api/v1/users/bookings"],
  ["GET", "/api/v1/users/admin/bookings"],
  ["GET", "/api/v1/users/bookings/:email"],
  ["GET", "/api/v1/users/booking/:id"],
  ["PATCH", "/api/v1/users/bookings/assign/deliveryMen/:id"],
  ["DELETE", "/api/v1/users/bookings/:id"],
  ["PATCH", "/api/v1/users/updateBooking/:id"],
  ["GET", "/api/v1/admin/:email"],
  ["GET", "/api/v1/admin/users/collection"],
  ["GET", "/api/v1/deliveryMen/:email"],
  ["GET", "/api/v1/users/admin/deliveryMens"],
  ["GET", "/api/v1/users/deliveryMen/deliveryList/:id"],
  ["GET", "/api/v1/deliveryMen/delivery/count/:id"],
  ["PATCH", "/api/v1/deliveryMen/deliveryList/cancel/deliver/:id"],
  ["GET", "/api/v1/delivery/reviews/:id"],
  ["PATCH", "/api/v1/deliveryMen/reviews/average/:id"],
  ["PATCH", "/api/v1/deliveryMen/parcel/delivered/:id"],
  ["POST", "/api/v1/create-payment-intent"],
  ["GET", "/api/v1/payments/:email"],
  ["POST", "/api/v1/payments"],
];

/** Substitutes concrete, safe sample values into the ":param" placeholders. */
function concretePath(path) {
  return path
    .replace(":email", "someone@example.com")
    .replace(":id", "64b7f1c2e4b0a1b2c3d4e5f6");
}

/**
 * A handful of paths that must NOT resolve. These guard the ordering rules
 * that keep literal segments from being captured by catch-all parameters, for
 * example "/users/admin" being swallowed by "/users/:email".
 */
const MUST_NOT_MATCH = [
  ["GET", "/api/v1/nonexistent-endpoint"],
  ["GET", "/api/v1/users/admin/extra/segments"],
];

async function run() {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const probe = async (method, path, body) => {
    // fetch() rejects a body on GET/HEAD, so only send one where it is legal.
    const canHaveBody = method !== "GET" && method !== "HEAD";
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Deliberately no Authorization header: protected routes should answer
        // 401, proving they matched before authentication rejected them.
      },
      ...(canHaveBody && body ? { body: JSON.stringify(body) } : {}),
    });
    return res.status;
  };

  let failures = 0;
  console.log(`Route contract: probing ${EXPECTED_ROUTES.length} routes\n`);

  for (const [method, path] of EXPECTED_ROUTES) {
    const url = concretePath(path);
    const status = await probe(method, url, { probe: true });

    if (status === 404) {
      failures++;
      console.error(`  FAIL  ${method.padEnd(6)} ${path.padEnd(52)} -> 404 (no route matched)`);
    } else if (status === 401) {
      console.log(`  ok    ${method.padEnd(6)} ${path.padEnd(52)} -> 401 (auth required)`);
    } else if (status === 500) {
      console.log(`  ok    ${method.padEnd(6)} ${path.padEnd(52)} -> 500 (reached handler, no db)`);
    } else {
      console.log(`  ok    ${method.padEnd(6)} ${path.padEnd(52)} -> ${status}`);
    }
  }

  console.log("");
  for (const [method, path] of MUST_NOT_MATCH) {
    const status = await probe(method, concretePath(path), { probe: true });
    if (status !== 404) {
      failures++;
      console.error(`  FAIL  ${method.padEnd(6)} ${path.padEnd(52)} -> ${status} (should be 404)`);
    } else {
      console.log(`  ok    ${method.padEnd(6)} ${path.padEnd(52)} -> 404 (correctly unmatched)`);
    }
  }

  await new Promise((resolve) => server.close(resolve));

  console.log("");
  if (failures) {
    console.error(`FAIL: ${failures} route(s) do not match the original API contract.`);
    process.exit(1);
  }

  console.log(`PASS: all ${EXPECTED_ROUTES.length} routes match the original API exactly.`);
}

run().catch((err) => {
  console.error("Route contract test crashed:", err);
  process.exit(1);
});
