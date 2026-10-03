/**
 * Image upload tests (Multer + Cloudinary) against an in-memory MongoDB.
 *
 * Uses a real Better Auth sign-in token like authz.test.js. Cloudinary
 * credentials are deliberately NOT set here, which proves the graceful
 * degradation path: validation (auth, file type, size, presence) all runs
 * before any Cloudinary call, and a valid upload without credentials gets a
 * 503 naming the missing env vars instead of a crash.
 *
 * Run with: `npm test --workspace=@parcel/api`.
 */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";
process.env.BETTER_AUTH_SECRET ||= "test-secret-0123456789abcdef-test-secret";
process.env.BETTER_AUTH_URL ||= "http://localhost:5000";
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.CLOUDINARY_API_KEY;
delete process.env.CLOUDINARY_API_SECRET;

const ORIGIN = "http://localhost:5173";
const PASSWORD = "password1234";

let mongod;
let server;
let base;
let token;

// 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function upload({ file, filename = "avatar.png", type = "image/png", auth = true } = {}) {
  const form = new FormData();
  if (file !== undefined) {
    form.append("image", new Blob([file], { type }), filename);
  }
  const headers = { Origin: ORIGIN };
  if (auth) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}/api/v1/uploads/image`, {
    method: "POST",
    headers,
    body: form,
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

  const { connect } = require("../src/config/db");
  await connect();
  const { createApp } = require("../src/app");

  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;

  const headers = { "Content-Type": "application/json", Origin: ORIGIN };
  const signup = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "Uploader", email: "uploader@example.com", password: PASSWORD }),
  });
  assert.equal(signup.status, 200);
  await fetch(`${base}/api/v1/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "Uploader", email: "uploader@example.com" }),
  });
  const signin = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email: "uploader@example.com", password: PASSWORD }),
  });
  assert.equal(signin.status, 200);
  token = signin.headers.get("set-auth-token");
  assert.ok(token);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  const { close } = require("../src/config/db");
  await close();
  await mongod.stop();
});

describe("image uploads", () => {
  it("requires authentication before parsing the file", async () => {
    const { status } = await upload({ file: PNG, auth: false });
    assert.equal(status, 401);
  });

  it("rejects non-image files with INVALID_FILE_TYPE", async () => {
    const { status, json } = await upload({
      file: Buffer.from("not an image"),
      filename: "evil.txt",
      type: "text/plain",
    });
    assert.equal(status, 400);
    assert.equal(json.code, "INVALID_FILE_TYPE");
  });

  it("rejects oversized files with FILE_TOO_LARGE", async () => {
    const { status, json } = await upload({ file: Buffer.alloc(6 * 1024 * 1024) });
    assert.equal(status, 400);
    assert.equal(json.code, "FILE_TOO_LARGE");
  });

  it("rejects requests with no file as NO_FILE", async () => {
    const { status, json } = await upload({ file: undefined });
    assert.equal(status, 400);
    assert.equal(json.code, "NO_FILE");
  });

  it("returns 503 (not a crash) when Cloudinary is unconfigured", async () => {
    const { status, json } = await upload({ file: PNG });
    assert.equal(status, 503);
    assert.equal(json.code, "UPLOAD_UNAVAILABLE");
  });
});
