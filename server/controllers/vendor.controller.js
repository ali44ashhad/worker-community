import Vendor from "../models/vendor.model.js";

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeOptional = (value) => String(value || "").trim();

/** Members see vendors only for the community they joined (`communityCommunName`). */
const getVendorCommunityHandle = (user) => {
  if (!user) return "";
  if (user.role === "secretary") {
    return user.communName ? String(user.communName).trim().toLowerCase() : "";
  }
  return user.communityCommunName ? String(user.communityCommunName).trim().toLowerCase() : "";
};

/**
 * Secretary: list categories based on already-created vendors
 * GET /api/secretary/vendors/categories
 */
const listVendorCategoriesForSecretary = async (req, res) => {
  try {
    const communityHandle = req.user?.communName ? String(req.user.communName).trim().toLowerCase() : "";
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: { categories: [], needsCommunName: true, communityCommunName: null },
      });
    }

    const categories = await Vendor.distinct("category", { communityCommunName: communityHandle });
    categories.sort((a, b) => String(a).localeCompare(String(b)));

    return res.status(200).json({
      success: true,
      data: { categories, needsCommunName: false, communityCommunName: communityHandle },
    });
  } catch (error) {
    console.error("listVendorCategoriesForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: list vendors (optionally filter by category)
 * GET /api/secretary/vendors?category=
 */
const listVendorsForSecretary = async (req, res) => {
  try {
    const communityHandle = req.user?.communName ? String(req.user.communName).trim().toLowerCase() : "";
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: { vendors: [], needsCommunName: true, communityCommunName: null },
      });
    }

    const category = normalizeCategory(req.query?.category);
    const query = { communityCommunName: communityHandle };
    if (category) query.category = category;

    const vendors = await Vendor.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: { vendors, needsCommunName: false, communityCommunName: communityHandle },
    });
  } catch (error) {
    console.error("listVendorsForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: create vendor
 * POST /api/secretary/vendors
 */
const createVendorForSecretary = async (req, res) => {
  try {
    const communityHandle = req.user?.communName ? String(req.user.communName).trim().toLowerCase() : "";
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const category = normalizeCategory(req.body?.category);
    const name = normalizeOptional(req.body?.name);
    const phone = normalizeOptional(req.body?.phone);
    const email = normalizeOptional(req.body?.email).toLowerCase();
    const service = normalizeOptional(req.body?.service);

    if (!category) return res.status(400).json({ success: false, message: "Category is required." });
    if (!name) return res.status(400).json({ success: false, message: "Vendor name is required." });
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "Phone or email is required." });
    }

    const vendor = await Vendor.create({
      communityCommunName: communityHandle,
      category,
      name,
      phone,
      email,
      service,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Vendor created.",
      data: { vendor },
    });
  } catch (error) {
    console.error("createVendorForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: delete vendor
 * DELETE /api/secretary/vendors/:vendorId
 */
const deleteVendorForSecretary = async (req, res) => {
  try {
    const communityHandle = req.user?.communName ? String(req.user.communName).trim().toLowerCase() : "";
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const { vendorId } = req.params;
    const vendor = await Vendor.findOne({ _id: vendorId, communityCommunName: communityHandle });
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found." });

    await vendor.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Vendor deleted.",
      data: { vendorId },
    });
  } catch (error) {
    console.error("deleteVendorForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Community (customer/provider/secretary): visiting-card list
 * GET /api/vendors/community
 */
const getCommunityVendors = async (req, res) => {
  try {
    const communityHandle = getVendorCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: { categories: [], vendorsByCategory: {}, communityCommunName: null, needsCommunity: true },
      });
    }

    const vendors = await Vendor.find({ communityCommunName: communityHandle })
      .sort({ category: 1, createdAt: -1 })
      .lean();
    const vendorsByCategory = vendors.reduce((acc, v) => {
      const key = v.category || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    }, {});
    const categories = Object.keys(vendorsByCategory).sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      data: { categories, vendorsByCategory, communityCommunName: communityHandle, needsCommunity: false },
    });
  } catch (error) {
    console.error("getCommunityVendors:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  listVendorCategoriesForSecretary,
  listVendorsForSecretary,
  createVendorForSecretary,
  deleteVendorForSecretary,
  getCommunityVendors,
};

