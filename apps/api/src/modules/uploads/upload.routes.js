const express = require("express");
const { uploadAvatar } = require("./upload.service");
const { verifyToken } = require("../../middleware/auth");
const { uploadSingleImage } = require("../../middleware/upload");

const router = express.Router();

/*
 * Image uploads hang off /api/v1/uploads. Auth runs before Multer parsing
 * (401 before 400), matching the convention in the other feature routers:
 * anonymous probes never reach the file parser or Cloudinary.
 */
router.post("/image", verifyToken, uploadSingleImage, uploadAvatar);

module.exports = router;
