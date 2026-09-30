const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");

/**
 * Admin-only reads: the role probe used by the client route guards, and the
 * plain-user collection used by the All Users screen.
 */

/**
 * Reports whether the given email has the admin role.
 *
 * Note the inverted response shape ({ admin: true|false }) — the web client's
 * useAdmin hook reads `data.admin`, so the contract is kept as-is.
 */
const isAdmin = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.findOne({
    email: req.params.email,
    role: "admin",
  });

  res.send({ admin: Boolean(result) });
});

/** Every user holding the "user" role. */
const listUserCollection = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.find({ role: "user" }).toArray();
  res.send(result);
});

module.exports = { isAdmin, listUserCollection };
