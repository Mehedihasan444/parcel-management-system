const jwt = require("jsonwebtoken");
const { loadConfig } = require("../../config/env");
const { asyncHandler } = require("../../utils/asyncHandler");

/**
 * Issues the one-hour access token consumed by the web client's
 * useAxiosSecure hook. The token payload is the user document exactly as the
 * original server sent it, so the client's decoding expectations are unchanged.
 */
const createToken = asyncHandler(async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, loadConfig().accessTokenSecret, {
    expiresIn: "1h",
  });
  res.send({ token });
});

module.exports = { createToken };
