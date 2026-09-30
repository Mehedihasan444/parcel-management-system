const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { verifyToken } = require("../../middleware/auth");

/**
 * User reads and profile updates.
 *
 * NOTE ON ROUTE ORDER: `GET /admin` is declared before `GET /:email` in the
 * router. Express matches in declaration order, so the literal path has to
 * come first or `:email` would capture the string "admin". This mirrors the
 * original server and the ordering is load-bearing.
 */

const PAGE_SIZE = 5;

/** Creates a user, or reports that the email is already registered. */
const createUser = asyncHandler(async (req, res) => {
  const { users } = collections();
  const user = req.body;

  const existingUser = await users.findOne({ email: user.email });
  if (existingUser) {
    return res.send({ message: "user already exists", insertedId: null });
  }

  const result = await users.insertOne(user);
  res.send(result);
});

/** Every user, unpaginated. Used by the admin dashboard. */
const listAllUsers = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.find().toArray();
  res.send(result);
});

/** Paginated user list. Returns the page plus the total count. */
const listUsersPaginated = asyncHandler(async (req, res) => {
  const { users } = collections();
  const page = Number(req.query.page);
  const skip = (page - 1) * PAGE_SIZE;

  const result = await users.find().skip(skip).limit(PAGE_SIZE).toArray();
  const count = await users.estimatedDocumentCount();

  res.send({ result, count });
});

/** Single user lookup by email. */
const getUserByEmail = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.findOne({ email: req.params.email });
  res.send(result);
});

/** Updates a user's role. The original left verifyAdmin commented out here. */
const updateUserRole = asyncHandler(async (req, res) => {
  const { users } = collections();
  const { email } = req.params;
  const { role } = req.body;

  const result = await users.updateOne(
    { email },
    { $set: { role } }
  );
  res.send(result);
});

/** Upserts the mutable profile fields. */
const updateProfile = asyncHandler(async (req, res) => {
  const { users } = collections();
  const { email } = req.params;
  const data = req.body;

  const result = await users.updateOne(
    { email },
    {
      $set: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        image: data.image,
      },
    },
    { upsert: true }
  );
  res.send(result);
});

/** Records a review left against a delivery man. */
const createReview = asyncHandler(async (req, res) => {
  const { reviews } = collections();
  const result = await reviews.insertOne(req.body);
  res.send(result);
});

module.exports = {
  createUser,
  listAllUsers,
  listUsersPaginated,
  getUserByEmail,
  updateUserRole,
  updateProfile,
  createReview,
  verifyToken,
};
