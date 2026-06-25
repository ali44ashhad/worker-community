import {
  Baby,
  BookOpen,
  Briefcase,
  Building2,
  Cake,
  Camera,
  Car,
  ChefHat,
  Dog,
  Dumbbell,
  Flower2,
  Gift,
  Globe,
  GraduationCap,
  Hammer,
  HardHat,
  Heart,
  Home,
  Laptop,
  Layers,
  Leaf,
  Mic,
  Music,
  Paintbrush,
  Palette,
  PartyPopper,
  PersonStanding,
  Scale,
  Scissors,
  Shirt,
  ShoppingCart,
  Sofa,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Utensils,
  Video,
  Wrench,
  Zap,
} from 'lucide-react';

export const DEFAULT_CATEGORY_ICON = 'Layers';

export const CATEGORY_ICON_MAP = {
  Layers,
  GraduationCap,
  Music,
  PersonStanding,
  Dumbbell,
  ChefHat,
  Cake,
  Camera,
  Laptop,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Home,
  Shirt,
  Scale,
  Stethoscope,
  Palette,
  Sofa,
  HardHat,
  Building2,
  PartyPopper,
  Gift,
  Sparkles,
  BookOpen,
  Utensils,
  Wrench,
  Mic,
  Video,
  Globe,
  Users,
  Heart,
  Scissors,
  Flower2,
  Hammer,
  Paintbrush,
  Leaf,
  Zap,
  Car,
  Baby,
  Dog,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP).map((name) => ({
  name,
  Icon: CATEGORY_ICON_MAP[name],
}));

export const CATEGORY_NAME_ICON_DEFAULTS = {
  Academics: 'GraduationCap',
  Music: 'Music',
  Dance: 'PersonStanding',
  'Fitness & Sports': 'Dumbbell',
  'Home Cooking': 'ChefHat',
  'Home Catering': 'Utensils',
  'Home Baker': 'Cake',
  Catering: 'Utensils',
  'Professional Baker': 'Cake',
  Workshops: 'Wrench',
  Photography: 'Camera',
  Technology: 'Laptop',
  Consulting: 'Briefcase',
  Finance: 'TrendingUp',
  Groceries: 'ShoppingCart',
  'Home Products': 'Home',
  'Apparels & Footwear': 'Shirt',
  Law: 'Scale',
  Medical: 'Stethoscope',
  'Art & Craft': 'Palette',
  'Home Interiors': 'Sofa',
  Construction: 'HardHat',
  'Real Estate': 'Building2',
  'Event Planner': 'PartyPopper',
  Gifting: 'Gift',
  Beauty: 'Sparkles',
  Other: 'Layers',
};

export const resolveCategoryIconName = (icon, categoryName = '') => {
  const trimmed = String(icon || '').trim();
  if (trimmed && CATEGORY_ICON_MAP[trimmed]) {
    return trimmed;
  }

  const fromName = CATEGORY_NAME_ICON_DEFAULTS[String(categoryName || '').trim()];
  if (fromName && CATEGORY_ICON_MAP[fromName]) {
    return fromName;
  }

  return DEFAULT_CATEGORY_ICON;
};

export const getCategoryIconComponent = (icon, categoryName = '') => {
  const iconName = resolveCategoryIconName(icon, categoryName);
  return CATEGORY_ICON_MAP[iconName] || Layers;
};
