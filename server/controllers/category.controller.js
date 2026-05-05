import Category from "../models/category.model.js";

// Public: list active categories (used by frontend selectors)
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("name subCategories keywords description image isActive");

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error in getActiveCategories:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { getActiveCategories };

