import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed =
        file.mimetype.startsWith("image/") ||
        file.mimetype === "application/pdf" ||
        file.mimetype.startsWith("video/");

    if (allowed) {
        cb(null, true);
        return;
    }

    cb(new Error("Only image, PDF, and video files are allowed."), false);
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024, files: 5 },
    fileFilter,
});

export const eventAttachmentUpload = (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
        req.files = [];
        return next();
    }

    upload.array("attachments", 5)(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    success: false,
                    message: "Upload too large. Please keep each file under 50MB.",
                });
            }
            if (err.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                    success: false,
                    message: "You can attach up to 5 files per event.",
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || "Upload failed. Please try again.",
            });
        }

        req.files = req.files || [];
        next();
    });
};
