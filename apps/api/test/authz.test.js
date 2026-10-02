/**
 * Authorization tests against an in-memory MongoDB, using real Better Auth
 * flows: every token below comes from an actual sign-up + sign-in over HTTP
 * (captured from the documented `set-auth-token` response header), so these
 * cases prove the deployed session machinery, not a hand-minted JWT.
 *
 * Run with: `npm test --workspace=@parcel/api`.
 */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { ObjectId } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";
process.env.BETTER_AUTH_SECRET ||= "test-secret-0123456789abcdef-test-secret";
process.env.BETTER_AUTH_URL ||= "http://localhost:5000";

// Browsers always send Origin on POST; Better Auth's origin check requires it.
const ORIGIN = "http://localhost:5173";
const PASSWORD = "password1234";

let mongod;
let server;
let base;
let ids = {};
const TOKENS = {};

async function req(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json", Origin: ORIGIN };
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
    /* ignore */
  }
  return { status: res.status, json, headers: res.headers };
}

async function signupAndSignin(name, email, role) {
  const signup = await req("POST", "/api/auth/sign-up/email", {
    body: { name, email, password: PASSWORD },
  });
  assert.equal(signup.status, 200, `signup failed for ${email}: ${JSON.stringify(signup.json)}`);

  const profile = await req("POST", "/api/v1/users", {
    body: { name, email },
  });
  assert.equal(profile.status, 200);

  if (role && role !== "user") {
    const { collections } = require("../src/config/db");
    await collections().users.updateOne({ email }, { $set: { role } });
  }

  const signin = await req("POST", "/api/auth/sign-in/email", {
    body: { email, password: PASSWORD },
  });
  assert.equal(signin.status, 200, `signin failed for ${email}`);
  const token = signin.headers.get("set-auth-token");
  assert.ok(token, `no bearer token issued for ${email}`);
  TOKENS[email] = token;
}

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const { connect, collections } = require("../src/config/db");
  await connect();
  const { createApp } = require("../src/app");

  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;

  await signupAndSignin("Admin", "admin@example.com", "admin");
  await signupAndSignin("Alice", "alice@example.com", "user");
  await signupAndSignin("Bob", "bob@example.com", "user");
  await signupAndSignin("Carol", "carol@example.com", "user");
  await signupAndSignin("Rider", "rider@example.com", "deliveryMen");
  await signupAndSignin("Rider Two", "rider2@example.com", "deliveryMen");

  const { users, bookings } = collections();
  const rider = await users.findOne({ email: "rider@example.com" });
  const riderId = String(rider._id);
  const rider2 = await users.findOne({ email: "rider2@example.com" });
  const [bAlice, bBob, bAssign, bDelete, bRider] = await Promise.all([
    bookings.insertOne({ email: "alice@example.com", parcelType: "box", status: "pending" }),
    bookings.insertOne({ email: "bob@example.com", parcelType: "box", status: "pending" }),
    bookings.insertOne({ email: "bob@example.com", parcelType: "tube", status: "pending" }),
    bookings.insertOne({ email: "alice@example.com", parcelType: "env", status: "pending" }),
    bookings.insertOne({
      email: "alice@example.com",
      parcelType: "crate",
      status: "On The Way",
      deliveryMenID: riderId,
    }),
  ]);
  ids = {
    rider: riderId,
    rider2: String(rider2._id),
    bAlice: String(bAlice.insertedId),
    bBob: String(bBob.insertedId),
    bAssign: String(bAssign.insertedId),
    bDelete: String(bDelete.insertedId),
    bRider: String(bRider.insertedId),
  };
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  const { close } = require("../src/config/db");
  await close();
  await mongod.stop();
});

const T = (email) => TOKENS[email];

describe("signup and signin", () => {
  it("mounts the auth handler and validates signup bodies", async () => {
    const ok = await req("GET", "/api/auth/ok");
    assert.equal(ok.status, 200);
    assert.equal(ok.json.ok, true);

    const empty = await req("POST", "/api/auth/sign-up/email", { body: {} });
    assert.ok([400, 422].includes(empty.status), `expected 400/422, got ${empty.status}`);
    assert.ok(empty.json, "expected a JSON error body");
  });

  it("rejects bad passwords and duplicate emails", async () => {
    const bad = await req("POST", "/api/auth/sign-in/email", {
      body: { email: "alice@example.com", password: "wrongwrongwrong" },
    });
    assert.equal(bad.status, 401);
    const dup = await req("POST", "/api/auth/sign-up/email", {
      body: { name: "Alice 2", email: "alice@example.com", password: PASSWORD },
    });
    assert.ok([400, 422].includes(dup.status), `expected 400/422, got ${dup.status}`);
  });
});

describe("admin-only reads", () => {
  it("locks the bookings feed to admins", async () => {
    assert.equal((await req("GET", "/api/v1/users/admin/bookings")).status, 401);
    assert.equal(
      (await req("GET", "/api/v1/users/admin/bookings", { token: T("alice@example.com") })).status,
      403
    );
    const admin = await req("GET", "/api/v1/users/admin/bookings", {
      token: T("admin@example.com"),
    });
    assert.equal(admin.status, 200);
    assert.ok(Array.isArray(admin.json));
  });

  it("locks user enumeration to admins", async () => {
    assert.equal((await req("GET", "/api/v1/users/admin")).status, 401);
    assert.equal(
      (await req("GET", "/api/v1/users/admin", { token: T("alice@example.com") })).status,
      403
    );
    assert.equal(
      (await req("GET", "/api/v1/users/admin", { token: T("admin@example.com") })).status,
      200
    );
    assert.equal(
      (await req("GET", "/api/v1/users", { token: T("alice@example.com") })).status,
      403
    );
  });

  it("locks the delivery-partner roster and collection stats to admins", async () => {
    for (const path of ["/api/v1/users/admin/deliveryMens", "/api/v1/admin/users/collection"]) {
      assert.equal((await req("GET", path, { token: T("alice@example.com") })).status, 403);
      assert.equal((await req("GET", path, { token: T("admin@example.com") })).status, 200);
    }
  });
});

describe("role changes", () => {
  it("refuses self-promotion to admin", async () => {
    const { status } = await req("PATCH", "/api/v1/users/alice@example.com", {
      body: { role: "admin" },
      token: T("alice@example.com"),
    });
    assert.equal(status, 403);
  });

  it("lets admins promote, then the promoted user passes admin gates", async () => {
    const promo = await req("PATCH", "/api/v1/users/carol@example.com", {
      body: { role: "admin" },
      token: T("admin@example.com"),
    });
    assert.equal(promo.status, 200);
    const check = await req("GET", "/api/v1/users/admin/bookings", {
      token: T("carol@example.com"),
    });
    assert.equal(check.status, 200);
  });

  it("forces every signup to role=user, ignoring the client", async () => {
    const res = await req("POST", "/api/v1/users", {
      body: { name: "Mallory", email: "mallory@example.com", role: "admin" },
    });
    assert.equal(res.status, 200);
    assert.ok(res.json.insertedId);
    const { collections } = require("../src/config/db");
    const doc = await collections().users.findOne({ email: "mallory@example.com" });
    assert.equal(doc.role, "user");
  });
});

describe("self-or-admin reads", () => {
  it("scopes user lookups to self or admin", async () => {
    assert.equal(
      (await req("GET", "/api/v1/users/bob@example.com", { token: T("alice@example.com") })).status,
      403
    );
    assert.equal(
      (await req("GET", "/api/v1/users/alice@example.com", { token: T("alice@example.com") }))
        .status,
      200
    );
    assert.equal(
      (await req("GET", "/api/v1/users/bob@example.com", { token: T("admin@example.com") })).status,
      200
    );
  });

  it("scopes profile updates to self or admin", async () => {
    const other = await req("PUT", "/api/v1/users/updateProfile/bob@example.com", {
      body: { phone: "0000" },
      token: T("alice@example.com"),
    });
    assert.equal(other.status, 403);
    const own = await req("PUT", "/api/v1/users/updateProfile/alice@example.com", {
      body: { phone: "1111" },
      token: T("alice@example.com"),
    });
    assert.equal(own.status, 200);
  });

  it("scopes the admin-check endpoint to self or admin", async () => {
    assert.equal(
      (await req("GET", "/api/v1/admin/bob@example.com", { token: T("alice@example.com") })).status,
      403
    );
    const own = await req("GET", "/api/v1/admin/alice@example.com", {
      token: T("alice@example.com"),
    });
    assert.equal(own.status, 200);
    assert.equal(own.json.admin, false);
  });

  it("scopes the delivery-man check to self or admin", async () => {
    assert.equal(
      (await req("GET", "/api/v1/deliveryMen/rider@example.com", { token: T("alice@example.com") }))
        .status,
      403
    );
    const own = await req("GET", "/api/v1/deliveryMen/rider@example.com", {
      token: T("rider@example.com"),
    });
    assert.equal(own.status, 200);
    assert.equal(own.json.deliveryMen, true);
  });
});

describe("booking ownership", () => {
  it("rejects booking writes that name another owner", async () => {
    const { status } = await req("POST", "/api/v1/users/bookings", {
      body: { email: "bob@example.com", phone: "1234", parcelType: "box", weight: "1" },
      token: T("alice@example.com"),
    });
    assert.equal(status, 403);
  });

  it("accepts a well-formed booking from its owner", async () => {
    const { status, json } = await req("POST", "/api/v1/users/bookings", {
      body: { email: "alice@example.com", phone: "1234", parcelType: "box", weight: "1" },
      token: T("alice@example.com"),
    });
    assert.equal(status, 200);
    assert.ok(json.insertedId);
  });

  it("scopes booking lists to owner or admin", async () => {
    assert.equal(
      (
        await req("GET", "/api/v1/users/bookings/bob@example.com", {
          token: T("alice@example.com"),
        })
      ).status,
      403
    );
    const own = await req("GET", "/api/v1/users/bookings/alice@example.com", {
      token: T("alice@example.com"),
    });
    assert.equal(own.status, 200);
    assert.ok(own.json.every((b) => b.email === "alice@example.com"));
  });

  it("scopes single-booking reads to owner or admin, 404 when missing", async () => {
    assert.equal(
      (await req("GET", `/api/v1/users/booking/${ids.bAlice}`, { token: T("bob@example.com") }))
        .status,
      403
    );
    assert.equal(
      (
        await req("GET", `/api/v1/users/booking/${ids.bAlice}`, {
          token: T("alice@example.com"),
        })
      ).status,
      200
    );
    assert.equal(
      (
        await req("GET", `/api/v1/users/booking/${ids.bAlice}`, {
          token: T("admin@example.com"),
        })
      ).status,
      200
    );
    const missing = await req("GET", `/api/v1/users/booking/${new ObjectId()}`, {
      token: T("admin@example.com"),
    });
    assert.equal(missing.status, 404);
    assert.equal(missing.json.code, "NOT_FOUND");
  });

  it("restricts assignment to admins", async () => {
    assert.equal(
      (
        await req("PATCH", `/api/v1/users/bookings/assign/deliveryMen/${ids.bAssign}`, {
          body: { selectedDeliveryMen: ids.rider, approximateDeliveryDate: "2026-11-01" },
          token: T("alice@example.com"),
        })
      ).status,
      403
    );
    const admin = await req("PATCH", `/api/v1/users/bookings/assign/deliveryMen/${ids.bAssign}`, {
      body: { selectedDeliveryMen: ids.rider, approximateDeliveryDate: "2026-11-01" },
      token: T("admin@example.com"),
    });
    assert.equal(admin.status, 200);
  });

  it("lets owners edit and cancel their own parcels only", async () => {
    assert.equal(
      (
        await req("PATCH", `/api/v1/users/updateBooking/${ids.bDelete}`, {
          body: { phone: "9999" },
          token: T("bob@example.com"),
        })
      ).status,
      403
    );
    const edit = await req("PATCH", `/api/v1/users/updateBooking/${ids.bDelete}`, {
      body: { phone: "9999" },
      token: T("alice@example.com"),
    });
    assert.equal(edit.status, 200);
    assert.equal(
      (
        await req("DELETE", `/api/v1/users/bookings/${ids.bDelete}`, {
          token: T("bob@example.com"),
        })
      ).status,
      403
    );
    const del = await req("DELETE", `/api/v1/users/bookings/${ids.bDelete}`, {
      token: T("alice@example.com"),
    });
    assert.equal(del.status, 200);
  });
});

describe("rider assignment rules", () => {
  it("lets only the assignee or an admin transition a parcel", async () => {
    const path = `/api/v1/deliveryMen/deliveryList/cancel/deliver/${ids.bRider}`;
    assert.equal(
      (
        await req("PATCH", path, {
          body: { status: "Delivered" },
          token: T("rider2@example.com"),
        })
      ).status,
      403
    );
    const rider = await req("PATCH", path, {
      body: { status: "Delivered" },
      token: T("rider@example.com"),
    });
    assert.equal(rider.status, 200);
  });

  it("scopes delivery-man-scoped reads to the rider or an admin", async () => {
    const paths = [
      `/api/v1/users/deliveryMen/deliveryList/${ids.rider}`,
      `/api/v1/deliveryMen/delivery/count/${ids.rider}`,
      `/api/v1/delivery/reviews/${ids.rider}`,
    ];
    for (const path of paths) {
      assert.equal((await req("GET", path, { token: T("rider2@example.com") })).status, 403, path);
      assert.equal((await req("GET", path, { token: T("rider@example.com") })).status, 200, path);
      assert.equal((await req("GET", path, { token: T("admin@example.com") })).status, 200, path);
    }
  });

  it("lets riders and admins write the rider's own counters", async () => {
    const avg = `/api/v1/deliveryMen/reviews/average/${ids.rider}`;
    assert.equal(
      (await req("PATCH", avg, { body: { rating: 5 }, token: T("rider2@example.com") })).status,
      403
    );
    assert.equal(
      (await req("PATCH", avg, { body: { rating: 5 }, token: T("rider@example.com") })).status,
      200
    );
  });
});

describe("payment ownership", () => {
  it("requires auth for payment intents, then validates price", async () => {
    const anon = await req("POST", "/api/v1/create-payment-intent", { body: { price: 50 } });
    assert.equal(anon.status, 401);
    for (const price of [-5, 0, "free"]) {
      const { status, json } = await req("POST", "/api/v1/create-payment-intent", {
        body: { price },
        token: T("alice@example.com"),
      });
      assert.equal(status, 400, `price=${price} should be rejected`);
      assert.equal(json.errors[0].path, "price");
    }
  });

  it("refuses forged payment records and cross-user history", async () => {
    assert.equal(
      (
        await req("POST", "/api/v1/payments", {
          body: { email: "bob@example.com", price: 50, transactionId: "tx_forge" },
          token: T("alice@example.com"),
        })
      ).status,
      403
    );
    const record = await req("POST", "/api/v1/payments", {
      body: { email: "alice@example.com", price: 50, transactionId: "tx_1" },
      token: T("alice@example.com"),
    });
    assert.equal(record.status, 200);
    assert.equal(
      (await req("GET", "/api/v1/payments/bob@example.com", { token: T("alice@example.com") }))
        .status,
      403
    );
    const own = await req("GET", "/api/v1/payments/alice@example.com", {
      token: T("alice@example.com"),
    });
    assert.equal(own.status, 200);
    assert.ok(own.json.some((p) => p.transactionId === "tx_1"));
  });
});
