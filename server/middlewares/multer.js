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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB (increased to accommodate PDFs)
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
        // If it's a file type error, return a proper error
        if (err.message && err.message.includes("Only image files and PDFs")) {
          return res.status(400).json({ success: false, message: err.message });
        }
        // For "Unexpected field" or other multer errors, log and continue
        // This allows requests to proceed even if multer has issues
        console.log("Multer error (allowing request to continue):", err.message);
        req.files = [];
        return next();
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
