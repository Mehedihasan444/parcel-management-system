const express = require("express");
const { isAdmin, listUserCollection } = require("./admin.service");
const { verifyToken, verifyAdmin, verifySelfOrAdmin } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { emailParam } = require("../../middleware/schemas");

const router = express.Router();

/*
 * "/users/collection" is declared before "/:email" so the literal segment
 * wins over the parameter route.
 */
router.get("/users/collection", verifyToken, verifyAdmin, listUserCollection);
router.get(
  "/:email",
  verifyToken,
  validate({ params: emailParam }),
  verifySelfOrAdmin,
  isAdmin
);

module.exports = router;
