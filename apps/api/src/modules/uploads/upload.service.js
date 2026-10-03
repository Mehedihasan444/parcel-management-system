const { getCloudinary } = require("../../config/cloudinary");
const { asyncHandler } = require("../../utils/asyncHandler");

/**
 * Image uploads: Multer holds the file in memory, Cloudinary hosts it.
 *
 * Avatars are capped at 1024px (aspect preserved) with automatic quality and
 * format so profile pictures stay small without the client resizing them.
 * Cloudinary re-validates `resource_type: "image"` server-side, so a spoofed
 * mimetype that slips past Multer still cannot store a non-image.
 */

const AVATAR_FOLDER = "rapidparcelhub/avatars";

function uploadBuffer(buffer, folder = AVATAR_FOLDER) {
  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1024, height: 1024, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(
            Object.assign(new Error(`Image upload failed: ${error.message}`), {
              status: 502,
              code: "UPLOAD_FAILED",
            })
          );
        } else {
          resolve(result);
        }
      }
    );
    stream.end(buffer);
  });
}

/** Stores the uploaded avatar and returns its public URL. */
const uploadAvatar = asyncHandler(async (req, res) => {
  const result = await uploadBuffer(req.file.buffer);
  res.status(201).json({ url: result.secure_url, publicId: result.public_id });
});

module.exports = { uploadAvatar, uploadBuffer, AVATAR_FOLDER };
