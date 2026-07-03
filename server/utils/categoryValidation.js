import Category from "../models/category.model.js";

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export async function validateCategorySelection({
  serviceCategory,
  subCategories,
  keywords,
  // Values already persisted on the service. These are "grandfathered" so that
  // legacy data (e.g. a keyword later removed from the category taxonomy) does
  // not block unrelated edits such as uploading new images.
  existingSubCategories = [],
  existingKeywords = [],
}) {
  const categoryName = String(serviceCategory || "").trim();
  if (!categoryName) {
    const err = new Error("Service category is required.");
    err.statusCode = 400;
    throw err;
  }

  const category = await Category.findOne({ name: categoryName, isActive: true }).lean();
  if (!category) {
    const err = new Error(`Invalid service category: "${categoryName}".`);
    err.statusCode = 400;
    throw err;
  }

  const chosenSubCategories = normalizeArray(subCategories).filter(Boolean).map(String);
  const chosenKeywords = normalizeArray(keywords).filter(Boolean).map(String);

  const allowedSub = new Set((category.subCategories || []).map(String));
  const allowedKeywords = new Set((category.keywords || []).map(String));

  for (const s of normalizeArray(existingSubCategories).filter(Boolean)) {
    allowedSub.add(String(s));
  }
  for (const k of normalizeArray(existingKeywords).filter(Boolean)) {
    allowedKeywords.add(String(k));
  }

  const invalidSubCategories = chosenSubCategories.filter((s) => !allowedSub.has(String(s)));
  const invalidKeywords = chosenKeywords.filter((k) => !allowedKeywords.has(String(k)));

  if (invalidSubCategories.length > 0) {
    const err = new Error(
      `Invalid subcategories for "${categoryName}": ${invalidSubCategories.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  if (invalidKeywords.length > 0) {
    const err = new Error(
      `Invalid specializations for "${categoryName}": ${invalidKeywords.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  return {
    category,
    serviceCategory: categoryName,
    subCategories: chosenSubCategories,
    keywords: chosenKeywords,
  };
}

