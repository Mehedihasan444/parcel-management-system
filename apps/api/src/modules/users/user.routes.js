const express = require("express");
const {
  createUser,
  listAllUsers,
  listUsersPaginated,
  getUserByEmail,
  updateUserRole,
  updateProfile,
  createReview,
} = require("./user.service");
const { verifyToken, verifyAdmin, verifySelfOrAdmin } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const {
  userBody,
  roleBody,
  profileBody,
  reviewBody,
  emailParam,
} = require("../../middleware/schemas");

const router = express.Router();

/*
 * Order matters: the literal "/admin" route must be declared before the
 * "/:email" parameter route, otherwise ":email" would match "admin".
 * Reads are admin-only or self-or-admin; role changes are admin-only.
 */
router.get("/admin", verifyToken, verifyAdmin, listAllUsers);
router.post("/reviews", verifyToken, validate({ body: reviewBody }), createReview);
router.get("/", verifyToken, verifyAdmin, listUsersPaginated);
router.post("/", validate({ body: userBody }), createUser);
router.get(
  "/:email",
  verifyToken,
  validate({ params: emailParam }),
  verifySelfOrAdmin,
  getUserByEmail
);
router.patch(
  "/:email",
  verifyToken,
  validate({ params: emailParam, body: roleBody }),
  verifyAdmin,
  updateUserRole
);
router.put(
  "/updateProfile/:email",
  verifyToken,
  validate({ params: emailParam, body: profileBody }),
  verifySelfOrAdmin,
  updateProfile
);

module.exports = router;
