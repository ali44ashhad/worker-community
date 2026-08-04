/** Default local-business categories and service/product sub-categories. */
export const BUSINESS_CATEGORY_DEFAULTS = {
  Salon: {
    sortOrder: 1,
    subCategories: ["Hair Cutting", "Beard Trim", "Hair Spa", "Facial", "Waxing", "Hair Coloring"],
  },
  Restaurant: {
    sortOrder: 2,
    subCategories: ["Dine-in", "Takeaway", "Delivery", "Catering"],
  },
  Grocery: {
    sortOrder: 3,
    subCategories: ["Packaged Foods", "Fresh Produce", "Dairy", "Beverages"],
  },
  Medical: {
    sortOrder: 4,
    subCategories: ["Consultation", "Diagnostics", "Procedures"],
  },
  Pharmacy: {
    sortOrder: 5,
    subCategories: ["Prescription", "OTC Medicines", "Health Devices"],
  },
  Gym: {
    sortOrder: 6,
    subCategories: ["Monthly Membership", "Personal Training", "Group Classes"],
  },
  Clothing: {
    sortOrder: 7,
    subCategories: ["Men", "Women", "Kids", "Accessories"],
  },
  Electronics: {
    sortOrder: 8,
    subCategories: ["Mobiles", "Laptops", "Accessories", "Repair"],
  },
  "Home Services": {
    sortOrder: 9,
    subCategories: ["Plumbing", "Electrical", "Cleaning", "Painting"],
  },
  Automobile: {
    sortOrder: 10,
    subCategories: ["Service", "Spare Parts", "Detailing", "Towing"],
  },
  Others: {
    sortOrder: 11,
    subCategories: ["General"],
  },
};
