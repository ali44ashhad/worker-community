import React from 'react';
import { useSelector } from 'react-redux';
import ProviderLayout from '../layouts/ProviderLayout';
import CustomerLayout from '../layouts/CustomerLayout';

const ProviderAwareLayout = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (user?.role === 'provider') {
    return <ProviderLayout>{children}</ProviderLayout>;
  }

  if (user?.role === 'customer') {
    return <CustomerLayout>{children}</CustomerLayout>;
  }

  return children;
};

export default ProviderAwareLayout;
