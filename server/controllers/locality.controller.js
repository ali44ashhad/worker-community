import Locality from "../models/locality.model.js";
import { seedLocalitiesIfMissing } from "../utils/seedLocalities.js";

const clampPercent = (value, fallback = 50) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(100, Math.max(0, Math.round(num * 10) / 10));
};

const normalizeStatus = (status) => {
    if (status === "active" || status === "comingSoon") return status;
    return null;
};

/**
 * @description Public list of visible localities for the home map
 * @route GET /api/localities
 */
export const listLocalitiesPublic = async (_req, res) => {
    try {
        await seedLocalitiesIfMissing();
        const localities = await Locality.find({ isVisible: true })
            .sort({ sortOrder: 1, createdAt: 1 })
            .select("name status x y sortOrder")
            .lean();

        return res.status(200).json({ success: true, localities });
    } catch (error) {
        console.error("listLocalitiesPublic:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Admin list of all localities
 * @route GET /api/admin/localities
 */
export const listLocalitiesAdmin = async (_req, res) => {
    try {
        await seedLocalitiesIfMissing();
        const localities = await Locality.find()
            .sort({ sortOrder: 1, createdAt: 1 })
            .lean();

        return res.status(200).json({ success: true, localities });
    } catch (error) {
        console.error("listLocalitiesAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Create a locality
 * @route POST /api/admin/localities
 */
export const createLocalityAdmin = async (req, res) => {
    try {
        const name = String(req.body?.name || "").trim();
        if (!name) {
            return res.status(400).json({ success: false, message: "Locality name is required." });
        }

        const status = normalizeStatus(req.body?.status) || "comingSoon";
        const x = clampPercent(req.body?.x, 50);
        const y = clampPercent(req.body?.y, 50);
        const sortOrderRaw = Number(req.body?.sortOrder);
        const sortOrder = Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0;

        const locality = await Locality.create({
            name,
            status,
            x,
            y,
            sortOrder,
            isVisible: req.body?.isVisible !== false,
        });

        return res.status(201).json({
            success: true,
            message: "Locality created.",
            locality,
        });
    } catch (error) {
        console.error("createLocalityAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update locality fields (name, status, position, visibility, sort)
 * @route PATCH /api/admin/localities/:localityId
 */
export const updateLocalityAdmin = async (req, res) => {
    try {
        const { localityId } = req.params;
        const locality = await Locality.findById(localityId);
        if (!locality) {
            return res.status(404).json({ success: false, message: "Locality not found." });
        }

        if (req.body?.name !== undefined) {
            const name = String(req.body.name || "").trim();
            if (!name) {
                return res.status(400).json({ success: false, message: "Locality name cannot be empty." });
            }
            locality.name = name;
        }

        if (req.body?.status !== undefined) {
            const status = normalizeStatus(req.body.status);
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'status must be "active" or "comingSoon".',
                });
            }
            locality.status = status;
        }

        if (req.body?.x !== undefined) locality.x = clampPercent(req.body.x, locality.x);
        if (req.body?.y !== undefined) locality.y = clampPercent(req.body.y, locality.y);

        if (req.body?.sortOrder !== undefined) {
            const sortOrder = Number(req.body.sortOrder);
            if (Number.isFinite(sortOrder)) locality.sortOrder = sortOrder;
        }

        if (typeof req.body?.isVisible === "boolean") {
            locality.isVisible = req.body.isVisible;
        }

        await locality.save();

        return res.status(200).json({
            success: true,
            message: "Locality updated.",
            locality,
        });
    } catch (error) {
        console.error("updateLocalityAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Delete a locality
 * @route DELETE /api/admin/localities/:localityId
 */
export const deleteLocalityAdmin = async (req, res) => {
    try {
        const { localityId } = req.params;
        const locality = await Locality.findByIdAndDelete(localityId);
        if (!locality) {
            return res.status(404).json({ success: false, message: "Locality not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Locality deleted.",
            localityId,
        });
    } catch (error) {
        console.error("deleteLocalityAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
