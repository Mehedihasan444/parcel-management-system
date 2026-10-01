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
const { verifyToken } = require("../../middleware/auth");
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
 */
router.get("/admin", listAllUsers);
router.post("/reviews", verifyToken, validate({ body: reviewBody }), createReview);
router.get("/", listUsersPaginated);
router.post("/", validate({ body: userBody }), createUser);
router.get("/:email", verifyToken, validate({ params: emailParam }), getUserByEmail);
router.patch(
  "/:email",
  verifyToken,
  validate({ params: emailParam, body: roleBody }),
  updateUserRole
);
router.put(
  "/updateProfile/:email",
  verifyToken,
  validate({ params: emailParam, body: profileBody }),
  updateProfile
);

module.exports = router;
