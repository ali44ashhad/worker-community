export const getCategoryDescription = (category) => {
  if (category?.subCategories?.length) {
    return category.subCategories.slice(0, 4).join(', ');
  }
  if (category?.keywords?.length) {
    return category.keywords.slice(0, 4).join(', ');
  }
  return 'Explore services in this category';
};
