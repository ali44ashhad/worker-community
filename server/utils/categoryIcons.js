export const DEFAULT_CATEGORY_ICON = "Layers";

export const ALLOWED_CATEGORY_ICONS = [
  "Layers",
  "GraduationCap",
  "Music",
  "PersonStanding",
  "Dumbbell",
  "ChefHat",
  "Cake",
  "Camera",
  "Laptop",
  "Briefcase",
  "TrendingUp",
  "ShoppingCart",
  "Home",
  "Shirt",
  "Scale",
  "Stethoscope",
  "Palette",
  "Sofa",
  "HardHat",
  "Building2",
  "PartyPopper",
  "Gift",
  "Sparkles",
  "BookOpen",
  "Utensils",
  "Wrench",
  "Mic",
  "Video",
  "Globe",
  "Users",
  "Heart",
  "Scissors",
  "Flower2",
  "Hammer",
  "Paintbrush",
  "Leaf",
  "Zap",
  "Car",
  "Baby",
  "Dog",
];

export const CATEGORY_NAME_ICON_DEFAULTS = {
  Academics: "GraduationCap",
  Music: "Music",
  Dance: "PersonStanding",
  "Fitness & Sports": "Dumbbell",
  "Home Cooking": "ChefHat",
  "Home Catering": "Utensils",
  "Home Baker": "Cake",
  Catering: "Utensils",
  "Professional Baker": "Cake",
  Workshops: "Wrench",
  Photography: "Camera",
  Technology: "Laptop",
  Consulting: "Briefcase",
  Finance: "TrendingUp",
  Groceries: "ShoppingCart",
  "Home Products": "Home",
  "Apparels & Footwear": "Shirt",
  Law: "Scale",
  Medical: "Stethoscope",
  "Art & Craft": "Palette",
  "Home Interiors": "Sofa",
  Construction: "HardHat",
  "Real Estate": "Building2",
  "Event Planner": "PartyPopper",
  Gifting: "Gift",
  Beauty: "Sparkles",
  Other: "Layers",
};

export const normalizeCategoryIcon = (icon, categoryName = "") => {
  const trimmed = String(icon || "").trim();
  if (trimmed && ALLOWED_CATEGORY_ICONS.includes(trimmed)) {
    return trimmed;
  }

  const fromName = CATEGORY_NAME_ICON_DEFAULTS[String(categoryName || "").trim()];
  if (fromName && ALLOWED_CATEGORY_ICONS.includes(fromName)) {
    return fromName;
  }

  return DEFAULT_CATEGORY_ICON;
};
