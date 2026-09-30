const express = require("express");
const { createToken } = require("./auth.service");

const router = express.Router();

router.post("/jwt", createToken);

module.exports = router;
