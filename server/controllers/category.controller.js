import Category from "../models/category.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";

// Public: list active categories (used by frontend selectors)
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("name subCategories keywords icon isActive");

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error in getActiveCategories:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { getActiveCategories };

// Public: top categories by total service clicks (serviceOfferingCount)
const getTopCategoriesByClicks = async (req, res) => {
  try {
    const limitParam = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 12) : 6;

    const top = await ServiceOffering.aggregate([
      {
        $group: {
          _id: "$serviceCategory",
          totalClicks: { $sum: { $ifNull: ["$serviceOfferingCount", 0] } },
          serviceCount: { $sum: 1 },
        },
      },
      { $sort: { totalClicks: -1, serviceCount: -1 } },
      { $limit: limit },
    ]);

    const names = top.map((t) => t._id).filter(Boolean);
    const categories = await Category.find({ name: { $in: names }, isActive: true })
      .select("name subCategories keywords icon isActive")
      .lean();

    const categoryMap = new Map(categories.map((c) => [c.name, c]));

    const result = top
      .map((t) => {
        const c = categoryMap.get(t._id);
        if (!c) return null;
        return {
          ...c,
          totalClicks: t.totalClicks || 0,
          serviceCount: t.serviceCount || 0,
        };
      })
      .filter(Boolean);

    return res.status(200).json({ success: true, categories: result });
  } catch (error) {
    console.error("Error in getTopCategoriesByClicks:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { getTopCategoriesByClicks };

