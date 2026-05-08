import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    return cb(new Error("Only image files and PDFs are allowed"), false);
  }
};

const upload = multer({
  storage,
  // NOTE: true "unlimited" with memoryStorage can exhaust RAM and crash the server.
  // Use a high cap to feel unlimited while staying safe.
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
  fileFilter,
});

// Custom middleware that handles errors gracefully and allows requests without files
export const uploadAny = (req, res, next) => {
  try {
    // Check Content-Type to see if this is a multipart request
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      // Not a multipart request, skip multer
      req.files = [];
      return next();
    }

    upload.any()(req, res, (err) => {
      if (err) {
        // Friendly messages for common upload failures (non-technical)
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "Upload too large. Please keep each file under 50MB.",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message: "Upload failed due to an unexpected file field. Please retry.",
          });
        }
        // If it's a file type error, return a proper error
        if (err.message && err.message.includes("Only image files and PDFs")) {
          return res.status(400).json({ success: false, message: err.message });
        }
        // For other multer errors, fail fast with a clear message
        console.log("Multer error:", err.message);
        return res.status(400).json({
          success: false,
          message: "Upload failed. Please try again with fewer/smaller files.",
        });
      }
      // Ensure req.files is always an array
      if (!req.files) {
        req.files = [];
      }
      next();
    });
  } catch (error) {
    // Catch any synchronous errors
    console.log("Multer middleware catch (allowing request to continue):", error.message);
    req.files = [];
    next();
  }
};

export default upload;
