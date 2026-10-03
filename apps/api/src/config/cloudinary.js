const { v2: cloudinary } = require("cloudinary");

/**
 * Lazily-configured Cloudinary client.
 *
 * Configuration is deferred to first upload (not require-time) so the API
 * boots, and the test suites run, without CLOUDINARY_* credentials. Uploads
 * attempted while unconfigured fail with a 503 that names the missing env
 * vars instead of crashing the process.
 */

let configured = false;

function getCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw Object.assign(
      new Error(
        "Image uploads are not configured (missing CLOUDINARY_CLOUD_NAME / " +
          "CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). Copy apps/api/.env.example " +
          "to apps/api/.env and fill them in from https://console.cloudinary.com."
      ),
      { status: 503, code: "UPLOAD_UNAVAILABLE" }
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

module.exports = { getCloudinary };
