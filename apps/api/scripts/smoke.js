// Smoke test: boot the real app and exercise the endpoints that do not
// need a database (GET /, /api/auth/ok, and the 401 path of a protected
// route), proving the modular server actually serves traffic. Authenticated
// flows need Mongo and live in test/authz.test.js instead.
process.env.DATABASE_LOCAL_USERNAME ||= "u";
process.env.DATABASE_LOCAL_PASSWORD ||= "p";
process.env.BETTER_AUTH_SECRET ||= "test-secret-0123456789abcdef-test-secret";
process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";

const { createApp } = require("../src/app");

const app = createApp();
const server = app.listen(5099);

server.once("listening", async () => {
  try {
    const root = await fetch("http://127.0.0.1:5099/");
    console.log(`GET  /                    -> ${root.status}  "${await root.text()}"`);

    const ok = await fetch("http://127.0.0.1:5099/api/auth/ok");
    console.log(`GET  /api/auth/ok         -> ${ok.status}  "${await ok.text()}"`);

    // A protected route with no Authorization header must be rejected.
    const protectedRoute = await fetch("http://127.0.0.1:5099/api/v1/users/someone@example.com");
    console.log(`GET  /users/:email (no auth) -> ${protectedRoute.status}`);

    server.close();
  } catch (err) {
    console.error("Smoke test failed:", err);
    server.close();
    process.exit(1);
  }
});
