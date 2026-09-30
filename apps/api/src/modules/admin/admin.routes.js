const express = require("express");
const { isAdmin, listUserCollection } = require("./admin.service");
const { verifyToken } = require("../../middleware/auth");

const router = express.Router();

/*
 * "/users/collection" is declared before "/:email" so the literal segment
 * wins over the parameter route.
 */
router.get("/users/collection", verifyToken, listUserCollection);
router.get("/:email", verifyToken, isAdmin);

module.exports = router;
