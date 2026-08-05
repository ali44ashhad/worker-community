import mongoose from "mongoose";
import BusinessCategory from "../models/businessCategory.model.js";
import LocalBusiness from "../models/localBusiness.model.js";
import {
  S3_FOLDERS,
  uploadBufferToS3,
  deleteS3AssetByUrl,
} from "../utils/s3Upload.js";
import { sanitizeBusinessDescriptionHtml } from "../utils/sanitizeHtml.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{7,30}$/;
const URL_RE = /^https?:\/\/.+/i;

const normalizeOptional = (value) => String(value ?? "").trim();

const normalizeRequired = (value) => String(value ?? "").trim();

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeOptional(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => normalizeOptional(item)).filter(Boolean);
      }
    } catch {
      // fall through to CSV
    }
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const uniqueStrings = (list) => Array.from(new Set((list || []).map((s) => String(s).trim()).filter(Boolean)));

/** Members see businesses only for the community they joined. */
const getMemberCommunityHandle = (user) => {
  if (!user) return "";
  if (user.role === "secretary") {
    return user.communName ? String(user.communName).trim().toLowerCase() : "";
  }
  return user.communityCommunName ? String(user.communityCommunName).trim().toLowerCase() : "";
};

const getSecretaryCommunityHandle = (secretary) =>
  secretary?.communName ? String(secretary.communName).trim().toLowerCase() : "";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isImageFile = (file) => Boolean(file?.mimetype && file.mimetype.startsWith("image/"));

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isDiscountCurrentlyValid = (business, now = new Date()) => {
  if (!business) return false;
  if (business.status !== "active") return false;
  if (business.hasDiscount === false) return false;
  const percentage = Number(business.discountPercentage) || 0;
  if (percentage <= 0) return false;
  const start = business.discountStartDate ? new Date(business.discountStartDate) : null;
  const end = business.discountEndDate ? new Date(business.discountEndDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  return start <= now && end >= now;
};

const toPublicBusiness = (business, { includeEligibility = true } = {}) => {
  const plain = typeof business.toObject === "function" ? business.toObject() : { ...business };
  const discountActive = isDiscountCurrentlyValid(plain);
  const percentage = discountActive ? plain.discountPercentage : 0;

  const eligibility = includeEligibility
    ? [
        ...(plain.discountedCategories || []).map((name) => ({
          name,
          eligible: discountActive,
          discountPercentage: discountActive ? percentage : 0,
          label: discountActive ? `${percentage}% Off` : "Not Applicable",
        })),
        ...(plain.nonDiscountedCategories || []).map((name) => ({
          name,
          eligible: false,
          discountPercentage: 0,
          label: "Not Applicable",
        })),
      ]
    : undefined;

  return {
    ...plain,
    discountActive,
    offerEligibility: eligibility,
  };
};

async function resolveAllowedServiceNames(businessCategoryNames) {
  const names = uniqueStrings(businessCategoryNames);
  if (names.length === 0) return { allowedCategories: [], allowedServices: new Set() };

  const docs = await BusinessCategory.find({
    name: { $in: names },
    isActive: true,
  })
    .select("name subCategories")
    .lean();

  if (docs.length !== names.length) {
    const found = new Set(docs.map((d) => d.name));
    const missing = names.filter((n) => !found.has(n));
    return { error: `Invalid or inactive business category: ${missing.join(", ")}` };
  }

  const allowedServices = new Set();
  docs.forEach((doc) => {
    (doc.subCategories || []).forEach((sub) => {
      const name = normalizeOptional(sub);
      if (name) allowedServices.add(name);
    });
  });

  return { allowedCategories: names, allowedServices };
}

async function validateBusinessPayload(body, { partial = false } = {}) {
  const errors = [];

  const businessName = body.businessName !== undefined ? normalizeRequired(body.businessName) : undefined;
  const description =
    body.description !== undefined ? sanitizeBusinessDescriptionHtml(body.description) : undefined;
  const ownerName = body.ownerName !== undefined ? normalizeRequired(body.ownerName) : undefined;
  const contactNumber = body.contactNumber !== undefined ? normalizeRequired(body.contactNumber) : undefined;
  const email = body.email !== undefined ? normalizeOptional(body.email).toLowerCase() : undefined;
  const address = body.address !== undefined ? normalizeRequired(body.address) : undefined;
  const website = body.website !== undefined ? normalizeOptional(body.website) : undefined;
  const status = body.status !== undefined ? normalizeOptional(body.status).toLowerCase() : undefined;

  const businessCategories =
    body.businessCategories !== undefined ? uniqueStrings(parseStringArray(body.businessCategories)) : undefined;
  const discountedCategories =
    body.discountedCategories !== undefined ? uniqueStrings(parseStringArray(body.discountedCategories)) : undefined;
  const nonDiscountedCategories =
    body.nonDiscountedCategories !== undefined
      ? uniqueStrings(parseStringArray(body.nonDiscountedCategories))
      : undefined;

  let hasDiscount;
  if (body.hasDiscount !== undefined && body.hasDiscount !== "") {
    const raw = body.hasDiscount;
    hasDiscount =
      raw === true ||
      raw === "true" ||
      raw === "1" ||
      raw === 1 ||
      raw === "yes";
  }

  let discountPercentage;
  if (body.discountPercentage !== undefined && body.discountPercentage !== "") {
    discountPercentage = Number(body.discountPercentage);
  }

  const discountStartDate =
    body.discountStartDate !== undefined
      ? body.discountStartDate === "" || body.discountStartDate === null
        ? null
        : parseDate(body.discountStartDate)
      : undefined;
  const discountEndDate =
    body.discountEndDate !== undefined
      ? body.discountEndDate === "" || body.discountEndDate === null
        ? null
        : parseDate(body.discountEndDate)
      : undefined;

  if (!partial || businessName !== undefined) {
    if (!businessName) errors.push("Business name is required.");
    else if (businessName.length > 120) errors.push("Business name is too long.");
  }
  if (!partial || ownerName !== undefined) {
    if (!ownerName) errors.push("Owner name is required.");
  }
  if (!partial || contactNumber !== undefined) {
    if (!contactNumber) errors.push("Contact number is required.");
    else if (!PHONE_RE.test(contactNumber)) errors.push("Contact number is invalid.");
  }
  if (email !== undefined && email) {
    if (!EMAIL_RE.test(email) || email.length > 120) errors.push("Email address is invalid.");
  }
  if (!partial || address !== undefined) {
    if (!address) errors.push("Business address is required.");
    else if (address.length > 500) errors.push("Business address is too long.");
  }
  if (description !== undefined && description.length > 10000) {
    errors.push("Description is too long.");
  }
  if (website !== undefined && website) {
    if (website.length > 300 || !URL_RE.test(website)) {
      errors.push("Website must be a valid http(s) URL.");
    }
  }
  if (!partial || businessCategories !== undefined) {
    if (!businessCategories?.length) errors.push("Select at least one business category.");
  }
  if (!partial && hasDiscount === undefined) {
    errors.push("Please choose whether this business has a discount.");
  }

  const discountEnabled = hasDiscount === true;

  if (discountEnabled) {
    if (!Number.isFinite(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
      errors.push("Discount percentage must be between 1 and 100.");
    }
    if (!discountStartDate) errors.push("Discount start date is required.");
    if (!discountEndDate) errors.push("Discount end date is required.");
    if (discountStartDate && discountEndDate && discountEndDate < discountStartDate) {
      errors.push("Discount end date must be on or after the start date.");
    }
  } else if (hasDiscount === false) {
    // Clear discount fields when explicitly disabled
    discountPercentage = 0;
  }

  if (status !== undefined && !["active", "inactive"].includes(status)) {
    errors.push("Status must be active or inactive.");
  }

  if (errors.length) return { errors };

  let categoryResolution = null;
  if (businessCategories) {
    categoryResolution = await resolveAllowedServiceNames(businessCategories);
    if (categoryResolution.error) return { errors: [categoryResolution.error] };
  }

  if (discountEnabled && (discountedCategories || nonDiscountedCategories)) {
    const allowedServices = categoryResolution?.allowedServices;
    if (!allowedServices) {
      // For partial updates without category change, caller must pass existing categories.
      return { needsExistingCategories: true };
    }

    const discounted = discountedCategories || [];
    const nonDiscounted = nonDiscountedCategories || [];
    const overlap = discounted.filter((name) => nonDiscounted.includes(name));
    if (overlap.length) {
      return { errors: [`A service cannot be both discounted and non-discounted: ${overlap.join(", ")}`] };
    }

    const invalidDiscounted = discounted.filter((name) => !allowedServices.has(name));
    const invalidNonDiscounted = nonDiscounted.filter((name) => !allowedServices.has(name));
    if (invalidDiscounted.length || invalidNonDiscounted.length) {
      return {
        errors: [
          `Unknown service categories for selected business types: ${[...invalidDiscounted, ...invalidNonDiscounted].join(", ")}`,
        ],
      };
    }
  }

  const data = {
    ...(businessName !== undefined ? { businessName } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(ownerName !== undefined ? { ownerName } : {}),
    ...(contactNumber !== undefined ? { contactNumber } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(address !== undefined ? { address } : {}),
    ...(website !== undefined ? { website } : {}),
    ...(businessCategories !== undefined ? { businessCategories } : {}),
    ...(status !== undefined ? { status } : {}),
  };

  if (hasDiscount === false) {
    data.hasDiscount = false;
    data.discountPercentage = 0;
    data.discountedCategories = [];
    data.nonDiscountedCategories = [];
    data.discountStartDate = null;
    data.discountEndDate = null;
  } else if (hasDiscount === true) {
    data.hasDiscount = true;
    if (discountPercentage !== undefined) data.discountPercentage = discountPercentage;
    if (discountedCategories !== undefined) data.discountedCategories = discountedCategories;
    if (nonDiscountedCategories !== undefined) data.nonDiscountedCategories = nonDiscountedCategories;
    if (discountStartDate !== undefined) data.discountStartDate = discountStartDate;
    if (discountEndDate !== undefined) data.discountEndDate = discountEndDate;
  }

  return { data };
}

async function uploadBusinessImage(file, existingUrl) {
  if (!file) return null;
  if (!isImageFile(file)) {
    const error = new Error("Only image files are allowed for business logo/banner.");
    error.status = 400;
    throw error;
  }
  const uploaded = await uploadBufferToS3(file, S3_FOLDERS.BANNER);
  if (existingUrl) {
    await deleteS3AssetByUrl(existingUrl);
  }
  return uploaded;
}

/**
 * Active master categories for secretaries / forms
 * GET /api/secretary/local-businesses/categories
 * GET /api/local-businesses/categories
 */
const listActiveBusinessCategories = async (req, res) => {
  try {
    const categories = await BusinessCategory.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name subCategories sortOrder")
      .lean();

    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("listActiveBusinessCategories:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: list businesses (search / filter / status)
 * GET /api/secretary/local-businesses
 */
const listLocalBusinessesForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: { businesses: [], needsCommunName: true, communityCommunName: null },
      });
    }

    const search = normalizeOptional(req.query?.search);
    const category = normalizeOptional(req.query?.category);
    const status = normalizeOptional(req.query?.status).toLowerCase();

    const query = { communityCommunName: communityHandle };
    if (category) query.businessCategories = category;
    if (status === "active" || status === "inactive") query.status = status;
    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { businessName: { $regex: safe, $options: "i" } },
        { ownerName: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { contactNumber: { $regex: safe, $options: "i" } },
        { address: { $regex: safe, $options: "i" } },
      ];
    }

    const businesses = await LocalBusiness.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: {
        businesses,
        needsCommunName: false,
        communityCommunName: communityHandle,
      },
    });
  } catch (error) {
    console.error("listLocalBusinessesForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: get one business (scoped)
 * GET /api/secretary/local-businesses/:businessId
 */
const getLocalBusinessForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const { businessId } = req.params;
    if (!isValidObjectId(businessId)) {
      return res.status(400).json({ success: false, message: "Invalid business id." });
    }

    const business = await LocalBusiness.findOne({
      _id: businessId,
      communityCommunName: communityHandle,
    }).lean();

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    return res.status(200).json({ success: true, data: { business } });
  } catch (error) {
    console.error("getLocalBusinessForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: create business
 * POST /api/secretary/local-businesses
 */
const createLocalBusinessForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const validated = await validateBusinessPayload(req.body, { partial: false });
    if (validated.errors?.length) {
      return res.status(400).json({ success: false, message: validated.errors[0] });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const logoFile = files.find((f) => f.fieldname === "logo") || req.file;
    const bannerFile = files.find((f) => f.fieldname === "banner");

    let logoUpload = null;
    let bannerUpload = null;
    try {
      if (logoFile) logoUpload = await uploadBusinessImage(logoFile);
      if (bannerFile) bannerUpload = await uploadBusinessImage(bannerFile);
    } catch (uploadError) {
      return res.status(uploadError.status || 400).json({
        success: false,
        message: uploadError.message || "Image upload failed.",
      });
    }

    const business = await LocalBusiness.create({
      communityCommunName: communityHandle,
      ...validated.data,
      logoUrl: logoUpload?.url || "",
      logoPublicId: logoUpload?.public_id || "",
      bannerUrl: bannerUpload?.url || "",
      bannerPublicId: bannerUpload?.public_id || "",
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Business created.",
      data: { business },
    });
  } catch (error) {
    console.error("createLocalBusinessForSecretary:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: update business
 * PUT /api/secretary/local-businesses/:businessId
 */
const updateLocalBusinessForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const { businessId } = req.params;
    if (!isValidObjectId(businessId)) {
      return res.status(400).json({ success: false, message: "Invalid business id." });
    }

    const business = await LocalBusiness.findOne({
      _id: businessId,
      communityCommunName: communityHandle,
    });
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    const validated = await validateBusinessPayload(req.body, { partial: true });
    if (validated.errors?.length) {
      return res.status(400).json({ success: false, message: validated.errors[0] });
    }

    // When service lists change without categories in payload, validate against existing/next categories.
    if (validated.needsExistingCategories) {
      const nextCategories =
        validated.data?.businessCategories || business.businessCategories || [];
      const resolution = await resolveAllowedServiceNames(nextCategories);
      if (resolution.error) {
        return res.status(400).json({ success: false, message: resolution.error });
      }

      const discounted =
        req.body.discountedCategories !== undefined
          ? uniqueStrings(parseStringArray(req.body.discountedCategories))
          : business.discountedCategories || [];
      const nonDiscounted =
        req.body.nonDiscountedCategories !== undefined
          ? uniqueStrings(parseStringArray(req.body.nonDiscountedCategories))
          : business.nonDiscountedCategories || [];

      const overlap = discounted.filter((name) => nonDiscounted.includes(name));
      if (overlap.length) {
        return res.status(400).json({
          success: false,
          message: `A service cannot be both discounted and non-discounted: ${overlap.join(", ")}`,
        });
      }

      const invalid = [...discounted, ...nonDiscounted].filter(
        (name) => !resolution.allowedServices.has(name)
      );
      if (invalid.length) {
        return res.status(400).json({
          success: false,
          message: `Unknown service categories for selected business types: ${uniqueStrings(invalid).join(", ")}`,
        });
      }

      validated.data = {
        ...(validated.data || {}),
        ...(req.body.discountedCategories !== undefined ? { discountedCategories: discounted } : {}),
        ...(req.body.nonDiscountedCategories !== undefined
          ? { nonDiscountedCategories: nonDiscounted }
          : {}),
      };
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const logoFile = files.find((f) => f.fieldname === "logo");
    const bannerFile = files.find((f) => f.fieldname === "banner");

    try {
      if (logoFile) {
        const logoUpload = await uploadBusinessImage(logoFile, business.logoUrl);
        business.logoUrl = logoUpload.url;
        business.logoPublicId = logoUpload.public_id;
      }
      if (bannerFile) {
        const bannerUpload = await uploadBusinessImage(bannerFile, business.bannerUrl);
        business.bannerUrl = bannerUpload.url;
        business.bannerPublicId = bannerUpload.public_id;
      }
    } catch (uploadError) {
      return res.status(uploadError.status || 400).json({
        success: false,
        message: uploadError.message || "Image upload failed.",
      });
    }

    Object.assign(business, validated.data || {});
    business.updatedBy = req.user._id;
    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business updated.",
      data: { business },
    });
  } catch (error) {
    console.error("updateLocalBusinessForSecretary:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: set status active/inactive (disable without delete)
 * PATCH /api/secretary/local-businesses/:businessId/status
 */
const updateLocalBusinessStatusForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const { businessId } = req.params;
    if (!isValidObjectId(businessId)) {
      return res.status(400).json({ success: false, message: "Invalid business id." });
    }

    const status = normalizeOptional(req.body?.status).toLowerCase();
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be active or inactive." });
    }

    const business = await LocalBusiness.findOneAndUpdate(
      { _id: businessId, communityCommunName: communityHandle },
      { $set: { status, updatedBy: req.user._id } },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Business marked as ${status}.`,
      data: { business },
    });
  } catch (error) {
    console.error("updateLocalBusinessStatusForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: delete business
 * DELETE /api/secretary/local-businesses/:businessId
 */
const deleteLocalBusinessForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const { businessId } = req.params;
    if (!isValidObjectId(businessId)) {
      return res.status(400).json({ success: false, message: "Invalid business id." });
    }

    const business = await LocalBusiness.findOne({
      _id: businessId,
      communityCommunName: communityHandle,
    });
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    await deleteS3AssetByUrl(business.logoUrl);
    await deleteS3AssetByUrl(business.bannerUrl);
    await business.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Business deleted.",
      data: { businessId },
    });
  } catch (error) {
    console.error("deleteLocalBusinessForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Community members: browse active businesses in their community
 * GET /api/local-businesses/community
 */
const listCommunityLocalBusinesses = async (req, res) => {
  try {
    const communityHandle = getMemberCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: {
          businesses: [],
          communityCommunName: null,
          needsCommunity: true,
        },
      });
    }

    const search = normalizeOptional(req.query?.search);
    const category = normalizeOptional(req.query?.category);
    const now = new Date();

    const query = {
      communityCommunName: communityHandle,
      status: "active",
    };
    if (category) query.businessCategories = category;
    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { businessName: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
        { address: { $regex: safe, $options: "i" } },
      ];
    }

    const businesses = await LocalBusiness.find(query)
      .sort({ createdAt: -1 })
      .select(
        "businessName logoUrl bannerUrl description ownerName contactNumber email address website businessCategories hasDiscount discountPercentage discountedCategories nonDiscountedCategories discountStartDate discountEndDate status communityCommunName createdAt"
      )
      .lean();

    const payload = businesses.map((b) => toPublicBusiness(b));

    // Highest discount first; active offers before expired; then name.
    payload.sort((a, b) => {
      const pctA = Number(a.discountPercentage) || 0;
      const pctB = Number(b.discountPercentage) || 0;
      if (pctB !== pctA) return pctB - pctA;
      if (a.discountActive !== b.discountActive) return a.discountActive ? -1 : 1;
      return String(a.businessName).localeCompare(String(b.businessName));
    });

    return res.status(200).json({
      success: true,
      data: {
        businesses: payload,
        communityCommunName: communityHandle,
        needsCommunity: false,
        asOf: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("listCommunityLocalBusinesses:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Community members: business detail + offer eligibility
 * GET /api/local-businesses/community/:businessId
 */
const getCommunityLocalBusiness = async (req, res) => {
  try {
    const communityHandle = getMemberCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    const { businessId } = req.params;
    if (!isValidObjectId(businessId)) {
      return res.status(400).json({ success: false, message: "Invalid business id." });
    }

    const business = await LocalBusiness.findOne({
      _id: businessId,
      communityCommunName: communityHandle,
      status: "active",
    }).lean();

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    return res.status(200).json({
      success: true,
      data: { business: toPublicBusiness(business) },
    });
  } catch (error) {
    console.error("getCommunityLocalBusiness:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/* ─── Admin master category CRUD ─── */

const listBusinessCategoriesAdmin = async (req, res) => {
  try {
    const search = normalizeOptional(req.query?.search);
    const query = {};
    if (search) {
      query.name = { $regex: escapeRegex(search), $options: "i" };
    }

    const categories = await BusinessCategory.find(query).sort({ sortOrder: 1, name: 1 }).lean();
    return res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    console.error("listBusinessCategoriesAdmin:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createBusinessCategoryAdmin = async (req, res) => {
  try {
    const name = normalizeRequired(req.body?.name);
    const subCategories = uniqueStrings(parseStringArray(req.body?.subCategories));
    const sortOrder = Number(req.body?.sortOrder);
    const isActive = req.body?.isActive === undefined ? true : Boolean(req.body.isActive);

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }
    if (name.length > 60) {
      return res.status(400).json({ success: false, message: "Category name is too long." });
    }

    const existing = await BusinessCategory.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: "Category already exists." });
    }

    const category = await BusinessCategory.create({
      name,
      subCategories,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Business category created.",
      data: { category },
    });
  } catch (error) {
    console.error("createBusinessCategoryAdmin:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category already exists." });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateBusinessCategoryAdmin = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category id." });
    }

    const category = await BusinessCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    if (req.body?.name !== undefined) {
      const name = normalizeRequired(req.body.name);
      if (!name) {
        return res.status(400).json({ success: false, message: "Category name cannot be empty." });
      }
      if (name.length > 60) {
        return res.status(400).json({ success: false, message: "Category name is too long." });
      }
      const dup = await BusinessCategory.findOne({ name, _id: { $ne: categoryId } });
      if (dup) {
        return res.status(409).json({ success: false, message: "Category already exists." });
      }
      category.name = name;
    }

    if (req.body?.subCategories !== undefined) {
      category.subCategories = uniqueStrings(parseStringArray(req.body.subCategories));
    }
    if (req.body?.sortOrder !== undefined) {
      const sortOrder = Number(req.body.sortOrder);
      if (Number.isFinite(sortOrder)) category.sortOrder = sortOrder;
    }
    if (req.body?.isActive !== undefined) {
      category.isActive = Boolean(req.body.isActive);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Business category updated.",
      data: { category },
    });
  } catch (error) {
    console.error("updateBusinessCategoryAdmin:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateBusinessCategoryStatusAdmin = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category id." });
    }

    if (typeof req.body?.isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive boolean is required." });
    }

    const category = await BusinessCategory.findByIdAndUpdate(
      categoryId,
      { $set: { isActive: req.body.isActive } },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully.`,
      data: { category },
    });
  } catch (error) {
    console.error("updateBusinessCategoryStatusAdmin:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  listActiveBusinessCategories,
  listLocalBusinessesForSecretary,
  getLocalBusinessForSecretary,
  createLocalBusinessForSecretary,
  updateLocalBusinessForSecretary,
  updateLocalBusinessStatusForSecretary,
  deleteLocalBusinessForSecretary,
  listCommunityLocalBusinesses,
  getCommunityLocalBusiness,
  listBusinessCategoriesAdmin,
  createBusinessCategoryAdmin,
  updateBusinessCategoryAdmin,
  updateBusinessCategoryStatusAdmin,
};
