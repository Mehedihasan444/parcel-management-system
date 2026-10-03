/**
 * Seeds the three documented demo accounts (admin, rider, customer).
 *
 * Idempotent: existing auth users are kept, missing app-profile rows are
 * created, and roles are always enforced to the documented values — so it is
 * safe to re-run after a database reset or a role experiment gone wrong.
 *
 * Uses the REAL database from apps/api/.env (never the in-memory test one).
 *
 * Run with:  npm run seed:demo --workspace=@parcel/api
 */
const { connect, collections, close } = require("../src/config/db");
const { createApp } = require("../src/app");

const ORIGIN = "http://localhost:5173";

const DEMOS = [
  { name: "Demo Admin", email: "admin@g.com", password: "admin@g.com", role: "admin" },
  { name: "Demo Rider", email: "delivery@g.com", password: "delivery@g.com", role: "deliveryMen" },
  { name: "Demo Customer", email: "customer@g.com", password: "customer@g.com", role: "user" },
];

async function ensureDemo(base, { name, email, password, role }) {
  const headers = { "Content-Type": "application/json", Origin: ORIGIN };

  // Sign-up is idempotent here: 200 creates the auth user, 400/422 means the
  // email is already registered and we just repair the profile/role below.
  await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, email, password }),
  });

  const { users } = collections();
  const existing = await users.findOne({ email });
  if (existing) {
    if (existing.role !== role) {
      await users.updateOne({ email }, { $set: { role } });
      console.log(`  ${email}: role corrected to "${role}"`);
    } else {
      console.log(`  ${email}: already a "${role}", untouched`);
    }
    return;
  }

  await users.insertOne({ name, email, role });
  console.log(`  ${email}: profile created as "${role}"`);
}

async function run() {
  await connect();
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  console.log("Seeding demo accounts:");
  for (const demo of DEMOS) {
    // eslint-disable-next-line no-await-in-loop -- sequential by design
    await ensureDemo(base, demo);
  }

  await new Promise((resolve) => server.close(resolve));
  await close();
  console.log("Done. See apps/web/README.md for the credentials.");
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
