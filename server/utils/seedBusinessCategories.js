import BusinessCategory from "../models/businessCategory.model.js";
import { BUSINESS_CATEGORY_DEFAULTS } from "./seedBusinessCategoryDefaults.js";

/**
 * Seed missing business categories only. Never overwrites admin edits.
 */
export async function seedBusinessCategoriesIfMissing() {
  const entries = Object.entries(BUSINESS_CATEGORY_DEFAULTS || {});
  if (entries.length === 0) return;

  await Promise.all(
    entries.map(async ([name, def]) => {
      const subCategories = Array.isArray(def?.subCategories) ? def.subCategories : [];
      const sortOrder = Number.isFinite(def?.sortOrder) ? def.sortOrder : 0;

      await BusinessCategory.updateOne(
        { name },
        {
          $setOnInsert: {
            name,
            subCategories,
            sortOrder,
            isActive: true,
          },
        },
        { upsert: true }
      );
    })
  );
}
