/**
 * Authorization tests against an in-memory MongoDB.
 *
 * Boots mongodb-memory-server (binary downloads once, then caches), seeds
 * users/bookings across every role, and asserts the guard matrix: anonymous
 * gets 401, wrong-owner/wrong-role gets 403, owners and admins get through.
 * Run with: `npm test --workspace=@parcel/api`.
 */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";
process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";

let mongod;
let server;
let base;
let ids = {};

const tokenFor = (email) =>
  jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

const TOKENS = {
  admin: tokenFor("admin@example.com"),
  alice: tokenFor("alice@example.com"),
  bob: tokenFor("bob@example.com"),
  carol: tokenFor("carol@example.com"),
  rider: tokenFor("rider@example.com"),
  rider2: tokenFor("rider2@example.com"),
};

async function req(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
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
  return { status: res.status, json };
}

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const { connect, collections } = require("../src/config/db");
  await connect();
  const { createApp } = require("../src/app");

  const { users, bookings } = collections();
  const riderId = new ObjectId();
  const rider2Id = new ObjectId();
  await users.insertMany([
    { name: "Admin", email: "admin@example.com", role: "admin" },
    { name: "Alice", email: "alice@example.com", role: "user" },
    { name: "Bob", email: "bob@example.com", role: "user" },
    { name: "Carol", email: "carol@example.com", role: "user" },
    { _id: riderId, name: "Rider", email: "rider@example.com", role: "deliveryMen" },
    { _id: rider2Id, name: "Rider Two", email: "rider2@example.com", role: "deliveryMen" },
  ]);
  const [bAlice, bBob, bAssign, bDelete, bRider] = await Promise.all([
    bookings.insertOne({ email: "alice@example.com", parcelType: "box", status: "pending" }),
    bookings.insertOne({ email: "bob@example.com", parcelType: "box", status: "pending" }),
    bookings.insertOne({ email: "bob@example.com", parcelType: "tube", status: "pending" }),
    bookings.insertOne({ email: "alice@example.com", parcelType: "env", status: "pending" }),
    bookings.insertOne({
      email: "alice@example.com",
      parcelType: "crate",
      status: "On The Way",
      deliveryMenID: String(riderId),
    }),
  ]);
  ids = {
    rider: String(riderId),
    rider2: String(rider2Id),
    bAlice: String(bAlice.insertedId),
    bBob: String(bBob.insertedId),
    bAssign: String(bAssign.insertedId),
    bDelete: String(bDelete.insertedId),
    bRider: String(bRider.insertedId),
  };

  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  const { close } = require("../src/config/db");
  await close();
  await mongod.stop();
});

describe("admin-only reads", () => {
  it("locks the bookings feed to admins", async () => {
    assert.equal((await req("GET", "/api/v1/users/admin/bookings")).status, 401);
    assert.equal(
      (await req("GET", "/api/v1/users/admin/bookings", { token: TOKENS.alice })).status,
      403
    );
    const admin = await req("GET", "/api/v1/users/admin/bookings", { token: TOKENS.admin });
    assert.equal(admin.status, 200);
    assert.ok(Array.isArray(admin.json));
  });

  it("locks user enumeration to admins", async () => {
    assert.equal((await req("GET", "/api/v1/users/admin")).status, 401);
    assert.equal((await req("GET", "/api/v1/users/admin", { token: TOKENS.alice })).status, 403);
    assert.equal((await req("GET", "/api/v1/users/admin", { token: TOKENS.admin })).status, 200);
    assert.equal((await req("GET", "/api/v1/users", { token: TOKENS.alice })).status, 403);
  });

  it("locks the delivery-partner roster and collection stats to admins", async () => {
    for (const path of ["/api/v1/users/admin/deliveryMens", "/api/v1/admin/users/collection"]) {
      assert.equal((await req("GET", path, { token: TOKENS.alice })).status, 403);
      assert.equal((await req("GET", path, { token: TOKENS.admin })).status, 200);
    }
  });
});

describe("role changes", () => {
  it("refuses self-promotion to admin", async () => {
    const { status } = await req("PATCH", "/api/v1/users/alice@example.com", {
      body: { role: "admin" },
      token: TOKENS.alice,
    });
    assert.equal(status, 403);
  });

  it("lets admins promote, then the promoted user passes admin gates", async () => {
    const promo = await req("PATCH", "/api/v1/users/carol@example.com", {
      body: { role: "admin" },
      token: TOKENS.admin,
    });
    assert.equal(promo.status, 200);
    const check = await req("GET", "/api/v1/users/admin/bookings", {
      token: tokenFor("carol@example.com"),
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
      (await req("GET", "/api/v1/users/bob@example.com", { token: TOKENS.alice })).status,
      403
    );
    assert.equal(
      (await req("GET", "/api/v1/users/alice@example.com", { token: TOKENS.alice })).status,
      200
    );
    assert.equal(
      (await req("GET", "/api/v1/users/bob@example.com", { token: TOKENS.admin })).status,
      200
    );
  });

  it("scopes profile updates to self or admin", async () => {
    const other = await req("PUT", "/api/v1/users/updateProfile/bob@example.com", {
      body: { phone: "0000" },
      token: TOKENS.alice,
    });
    assert.equal(other.status, 403);
    const own = await req("PUT", "/api/v1/users/updateProfile/alice@example.com", {
      body: { phone: "1111" },
      token: TOKENS.alice,
    });
    assert.equal(own.status, 200);
  });

  it("scopes the admin-check endpoint to self or admin", async () => {
    assert.equal(
      (await req("GET", "/api/v1/admin/bob@example.com", { token: TOKENS.alice })).status,
      403
    );
    const own = await req("GET", "/api/v1/admin/alice@example.com", { token: TOKENS.alice });
    assert.equal(own.status, 200);
    assert.equal(own.json.admin, false);
  });

  it("scopes the delivery-man check to self or admin", async () => {
    assert.equal(
      (await req("GET", "/api/v1/deliveryMen/rider@example.com", { token: TOKENS.alice })).status,
      403
    );
    const own = await req("GET", "/api/v1/deliveryMen/rider@example.com", {
      token: TOKENS.rider,
    });
    assert.equal(own.status, 200);
    assert.equal(own.json.deliveryMen, true);
  });
});

describe("booking ownership", () => {
  it("rejects booking writes that name another owner", async () => {
    const { status } = await req("POST", "/api/v1/users/bookings", {
      body: { email: "bob@example.com", phone: "1234", parcelType: "box", weight: "1" },
      token: TOKENS.alice,
    });
    assert.equal(status, 403);
  });

  it("accepts a well-formed booking from its owner", async () => {
    const { status, json } = await req("POST", "/api/v1/users/bookings", {
      body: { email: "alice@example.com", phone: "1234", parcelType: "box", weight: "1" },
      token: TOKENS.alice,
    });
    assert.equal(status, 200);
    assert.ok(json.insertedId);
  });

  it("scopes booking lists to owner or admin", async () => {
    assert.equal(
      (await req("GET", "/api/v1/users/bookings/bob@example.com", { token: TOKENS.alice })).status,
      403
    );
    const own = await req("GET", "/api/v1/users/bookings/alice@example.com", {
      token: TOKENS.alice,
    });
    assert.equal(own.status, 200);
    assert.ok(own.json.every((b) => b.email === "alice@example.com"));
  });

  it("scopes single-booking reads to owner or admin, 404 when missing", async () => {
    assert.equal(
      (await req("GET", `/api/v1/users/booking/${ids.bAlice}`, { token: TOKENS.bob })).status,
      403
    );
    assert.equal(
      (await req("GET", `/api/v1/users/booking/${ids.bAlice}`, { token: TOKENS.alice })).status,
      200
    );
    assert.equal(
      (await req("GET", `/api/v1/users/booking/${ids.bAlice}`, { token: TOKENS.admin })).status,
      200
    );
    const missing = await req("GET", `/api/v1/users/booking/${new ObjectId()}`, {
      token: TOKENS.admin,
    });
    assert.equal(missing.status, 404);
    assert.equal(missing.json.code, "NOT_FOUND");
  });

  it("restricts assignment to admins", async () => {
    assert.equal(
      (
        await req("PATCH", `/api/v1/users/bookings/assign/deliveryMen/${ids.bAssign}`, {
          body: { selectedDeliveryMen: ids.rider, approximateDeliveryDate: "2026-11-01" },
          token: TOKENS.alice,
        })
      ).status,
      403
    );
    const admin = await req("PATCH", `/api/v1/users/bookings/assign/deliveryMen/${ids.bAssign}`, {
      body: { selectedDeliveryMen: ids.rider, approximateDeliveryDate: "2026-11-01" },
      token: TOKENS.admin,
    });
    assert.equal(admin.status, 200);
  });

  it("lets owners edit and cancel their own parcels only", async () => {
    assert.equal(
      (
        await req("PATCH", `/api/v1/users/updateBooking/${ids.bDelete}`, {
          body: { phone: "9999" },
          token: TOKENS.bob,
        })
      ).status,
      403
    );
    const edit = await req("PATCH", `/api/v1/users/updateBooking/${ids.bDelete}`, {
      body: { phone: "9999" },
      token: TOKENS.alice,
    });
    assert.equal(edit.status, 200);
    assert.equal(
      (await req("DELETE", `/api/v1/users/bookings/${ids.bDelete}`, { token: TOKENS.bob })).status,
      403
    );
    const del = await req("DELETE", `/api/v1/users/bookings/${ids.bDelete}`, {
      token: TOKENS.alice,
    });
    assert.equal(del.status, 200);
  });
});

describe("rider assignment rules", () => {
  it("lets only the assignee or an admin transition a parcel", async () => {
    const path = `/api/v1/deliveryMen/deliveryList/cancel/deliver/${ids.bRider}`;
    assert.equal(
      (await req("PATCH", path, { body: { status: "Delivered" }, token: TOKENS.rider2 })).status,
      403
    );
    const rider = await req("PATCH", path, {
      body: { status: "Delivered" },
      token: TOKENS.rider,
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
      assert.equal((await req("GET", path, { token: TOKENS.rider2 })).status, 403, path);
      assert.equal((await req("GET", path, { token: TOKENS.rider })).status, 200, path);
      assert.equal((await req("GET", path, { token: TOKENS.admin })).status, 200, path);
    }
  });

  it("lets riders and admins write the rider's own counters", async () => {
    const avg = `/api/v1/deliveryMen/reviews/average/${ids.rider}`;
    assert.equal(
      (await req("PATCH", avg, { body: { rating: 5 }, token: TOKENS.rider2 })).status,
      403
    );
    assert.equal(
      (await req("PATCH", avg, { body: { rating: 5 }, token: TOKENS.rider })).status,
      200
    );
  });
});

describe("payment ownership", () => {
  it("refuses forged payment records and cross-user history", async () => {
    assert.equal(
      (
        await req("POST", "/api/v1/payments", {
          body: { email: "bob@example.com", price: 50, transactionId: "tx_forge" },
          token: TOKENS.alice,
        })
      ).status,
      403
    );
    const record = await req("POST", "/api/v1/payments", {
      body: { email: "alice@example.com", price: 50, transactionId: "tx_1" },
      token: TOKENS.alice,
    });
    assert.equal(record.status, 200);
    assert.equal(
      (await req("GET", "/api/v1/payments/bob@example.com", { token: TOKENS.alice })).status,
      403
    );
    const own = await req("GET", "/api/v1/payments/alice@example.com", {
      token: TOKENS.alice,
    });
    assert.equal(own.status, 200);
    assert.ok(own.json.some((p) => p.transactionId === "tx_1"));
  });
});
