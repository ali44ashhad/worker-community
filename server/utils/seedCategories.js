import Category from "../models/category.model.js";
import { CATEGORY_DEFAULTS } from "./seedCategoryDefaults.js";
import { normalizeCategoryIcon } from "./categoryIcons.js";

export async function seedCategoriesIfMissing() {
  const entries = Object.entries(CATEGORY_DEFAULTS || {});
  if (entries.length === 0) return;

  // Only create missing categories. Do not overwrite admin-edited categories.
  await Promise.all(
    entries.map(async ([name, def]) => {
      const subCategories = Array.isArray(def?.subCategories) ? def.subCategories : [];
      const keywords = Array.isArray(def?.keywords) ? def.keywords : [];

      await Category.updateOne(
        { name },
        {
          $setOnInsert: {
            name,
            subCategories,
            keywords,
            icon: normalizeCategoryIcon("", name),
            isActive: true,
          },
        },
        { upsert: true }
      );
    })
  );
}

