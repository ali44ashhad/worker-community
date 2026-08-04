import multer from "multer";

const storage = multer.memoryStorage();

const imageOnlyFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const businessImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
  fileFilter: imageOnlyFilter,
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

/**
 * Multipart middleware for local-business logo/banner.
 * Non-multipart requests pass through (JSON updates without new images).
 */
export const localBusinessImageUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    req.files = [];
    return next();
  }

  businessImageUpload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Image too large. Please keep each image under 5MB.",
        });
      }
      if (err.message && err.message.includes("Only image files")) {
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({
        success: false,
        message: "Image upload failed. Please retry.",
      });
    }

    // Normalize multer fields object → flat array for controllers
    const filesObj = req.files || {};
    const flat = [];
    if (Array.isArray(filesObj.logo)) flat.push(...filesObj.logo);
    if (Array.isArray(filesObj.banner)) flat.push(...filesObj.banner);
    if (Array.isArray(filesObj)) {
      req.files = filesObj;
    } else {
      req.files = flat;
    }
    next();
  });
};
