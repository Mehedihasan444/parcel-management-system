const express = require("express");
const { createToken } = require("./auth.service");
const { validate } = require("../../middleware/validate");
const { jwtBody } = require("../../middleware/schemas");

const router = express.Router();

router.post("/jwt", validate({ body: jwtBody }), createToken);

module.exports = router;
