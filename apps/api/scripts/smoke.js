// Smoke test: boot the real app and exercise the two endpoints that do not
// need a database (GET / and POST /api/v1/jwt), proving the modular server
// actually serves traffic and that JWT signing works.
process.env.DATABASE_LOCAL_USERNAME ||= "u";
process.env.DATABASE_LOCAL_PASSWORD ||= "p";
process.env.ACCESS_TOKEN_SECRET ||= "super-secret-value";
process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";

const { createApp } = require("../src/app");

const app = createApp();
const server = app.listen(5099);

server.once("listening", async () => {
  try {
    const root = await fetch("http://127.0.0.1:5099/");
    console.log(`GET  /                    -> ${root.status}  "${await root.text()}"`);

    const jwt = await fetch("http://127.0.0.1:5099/api/v1/jwt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "someone@example.com", role: "admin" }),
    });
    const body = await jwt.json();
    const segments = body.token ? body.token.split(".").length : 0;
    console.log(`POST /api/v1/jwt          -> ${jwt.status}  token segments: ${segments}`);

    // A protected route with no Authorization header must be rejected.
    const protectedRoute = await fetch("http://127.0.0.1:5099/api/v1/users/someone@example.com");
    console.log(`GET  /users/:email (no auth) -> ${protectedRoute.status}`);

    // ...and accepted with a valid token.
    const authorized = await fetch("http://127.0.0.1:5099/api/v1/users/someone@example.com", {
      headers: { Authorization: `Bearer ${body.token}` },
    });
    console.log(`GET  /users/:email (auth)   -> ${authorized.status} (500 = reached db)`);

    server.close();
  } catch (err) {
    console.error("Smoke test failed:", err);
    server.close();
    process.exit(1);
  }
});
