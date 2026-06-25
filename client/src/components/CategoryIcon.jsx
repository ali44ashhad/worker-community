import React from 'react';
import { getCategoryIconComponent } from '../utils/categoryIcons';

const CategoryIcon = ({ icon, name, className = 'h-8 w-8', ...props }) => {
  const Icon = getCategoryIconComponent(icon, name);
  return <Icon className={className} aria-hidden {...props} />;
};

export default CategoryIcon;
