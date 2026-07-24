import Banner from "../models/banner.model.js";
import {
    S3_FOLDERS,
    deleteS3AssetByUrl,
    uploadBufferToS3,
} from "../utils/s3Upload.js";

/**
 * @description List all banners (admin)
 * @route GET /api/admin/banners
 */
export const listBannersAdmin = async (req, res) => {
    try {
        const banners = await Banner.find()
            .sort({ sortOrder: 1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            banners,
        });
    } catch (error) {
        console.error("listBannersAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Upload a new banner image (admin)
 * @route POST /api/admin/banners
 */
export const createBannerAdmin = async (req, res) => {
    try {
        const file =
            req.file ||
            (Array.isArray(req.files)
                ? req.files.find((f) => f.fieldname === "image" || f.mimetype?.startsWith("image/"))
                : null);

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a banner image.",
            });
        }

        if (!file.mimetype?.startsWith("image/")) {
            return res.status(400).json({
                success: false,
                message: "Only image files are allowed for banners.",
            });
        }

        const uploaded = await uploadBufferToS3(file, S3_FOLDERS.BANNER);
        const sortOrderRaw = req.body?.sortOrder;
        const sortOrder =
            sortOrderRaw !== undefined && sortOrderRaw !== ""
                ? Number(sortOrderRaw)
                : 0;

        const banner = await Banner.create({
            imageUrl: uploaded.url,
            public_id: uploaded.public_id,
            isActive: true,
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        });

        return res.status(201).json({
            success: true,
            message: "Banner uploaded successfully.",
            banner,
        });
    } catch (error) {
        console.error("createBannerAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Toggle / set banner active status (admin)
 * @route PATCH /api/admin/banners/:bannerId/status
 */
export const updateBannerStatusAdmin = async (req, res) => {
    try {
        const { bannerId } = req.params;
        const { isActive } = req.body || {};

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive (boolean) is required.",
            });
        }

        const banner = await Banner.findByIdAndUpdate(
            bannerId,
            { isActive },
            { new: true }
        );

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Banner ${isActive ? "activated" : "deactivated"}.`,
            banner,
        });
    } catch (error) {
        console.error("updateBannerStatusAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Delete a banner and its S3 object (admin)
 * @route DELETE /api/admin/banners/:bannerId
 */
export const deleteBannerAdmin = async (req, res) => {
    try {
        const { bannerId } = req.params;
        const banner = await Banner.findById(bannerId);

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found." });
        }

        await deleteS3AssetByUrl(banner.imageUrl);
        await Banner.findByIdAndDelete(bannerId);

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully.",
        });
    } catch (error) {
        console.error("deleteBannerAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Public/app: fetch active banners only
 * @route GET /api/banners
 */
export const listActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: -1 })
            .select("imageUrl sortOrder createdAt")
            .lean();

        return res.status(200).json({
            success: true,
            banners,
        });
    } catch (error) {
        console.error("listActiveBanners:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
