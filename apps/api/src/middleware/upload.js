const multer = require("multer");

/**
 * Single-image upload middleware (Multer, memory storage).
 *
 * Files stay in memory and are streamed to Cloudinary by the upload service,
 * so nothing is ever written to the server disk. Rejects non-images and files
 * over 5 MB with 400 JSON errors (via the central error handler) instead of
 * Multer's default 500s.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    return cb(
      Object.assign(new Error("Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed"), {
        status: 400,
        code: "INVALID_FILE_TYPE",
      })
    );
  },
});

/** Parses multipart field `image`; 400 when missing, oversized or not an image. */
function uploadSingleImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          Object.assign(new Error("File too large (max 5 MB)"), {
            status: 400,
            code: "FILE_TOO_LARGE",
          })
        );
      }
      // fileFilter rejections already carry status/code; anything else is a
      // client upload error too, never a 500.
      if (!err.status) {
        err.status = 400;
        err.code = err.code || "INVALID_UPLOAD";
      }
      return next(err);
    }
    if (!req.file) {
      return next(
        Object.assign(new Error("No image file provided (multipart field: image)"), {
          status: 400,
          code: "NO_FILE",
        })
      );
    }
    return next();
  });
}

/**
 * Single-file (CSV) upload middleware for bulk shipping.
 *
 * Parses multipart field "image" — the field name the web client appends the
 * bulk CSV under — keeping the file in memory for the route handler. Unlike
 * uploadSingleImage it does not reject a missing file itself: the /upload
 * handler answers its own `{ message, code: "NO_FILE" }` JSON. Rejects
 * non-CSV files and files over 5 MB with 400 JSON errors.
 */
const ALLOWED_CSV_MIME = new Set([
  "text/csv",
  "text/plain",
  "application/csv",
  "application/vnd.ms-excel",
  "application/octet-stream",
]);

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    // Browsers report CSVs inconsistently, so trust the extension as well.
    const isCsv = ALLOWED_CSV_MIME.has(file.mimetype) || /\.csv$/i.test(file.originalname || "");
    if (isCsv) return cb(null, true);
    return cb(
      Object.assign(new Error("Only CSV files are allowed"), {
        status: 400,
        code: "INVALID_FILE_TYPE",
      })
    );
  },
});

function uploadSingleFile(req, res, next) {
  csvUpload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          Object.assign(new Error("File too large (max 5 MB)"), {
            status: 400,
            code: "FILE_TOO_LARGE",
          })
        );
      }
      if (!err.status) {
        err.status = 400;
        err.code = err.code || "INVALID_UPLOAD";
      }
      return next(err);
    }
    return next();
  });
}

module.exports = { uploadSingleImage, uploadSingleFile, MAX_FILE_SIZE };
