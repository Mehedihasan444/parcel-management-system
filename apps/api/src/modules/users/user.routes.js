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

const router = express.Router();

/*
 * Order matters: the literal "/admin" route must be declared before the
 * "/:email" parameter route, otherwise ":email" would match "admin".
 */
router.get("/admin", listAllUsers);
router.post("/reviews", verifyToken, createReview);
router.get("/", listUsersPaginated);
router.post("/", createUser);
router.get("/:email", verifyToken, getUserByEmail);
router.patch("/:email", verifyToken, updateUserRole);
router.put("/updateProfile/:email", verifyToken, updateProfile);

module.exports = router;
