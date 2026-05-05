import Category from "../models/category.model.js";
import { SERVICE_RULES } from "../models/serviceOffering.model.js";

export async function seedCategoriesIfMissing() {
  const entries = Object.entries(SERVICE_RULES || {});
  if (entries.length === 0) return;

  // Only create missing categories. Do not overwrite admin-edited categories.
  await Promise.all(
    entries.map(async ([name, def]) => {
      const subCategories = Array.isArray(def?.subCategories) ? def.subCategories : [];
      const keywords = Array.isArray(def?.keywords) ? def.keywords : [];
      const description = typeof def?.description === "string" ? def.description : "";

      await Category.updateOne(
        { name },
        {
          $setOnInsert: {
            name,
            subCategories,
            keywords,
            description,
            isActive: true,
          },
        },
        { upsert: true }
      );
    })
  );
}

