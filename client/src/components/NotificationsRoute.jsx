import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProviderAwareLayout from './ProviderAwareLayout';
import SecretaryLayout from '../layouts/SecretaryLayout';
import NotificationsPage from '../pages/NotificationsPage';

const NotificationsRoute = () => {
  const user = useSelector((state) => state.auth.user);

  if (['customer', 'provider'].includes(user?.role)) {
    const accountStatus = user.accountStatus || 'approved';
    if (accountStatus !== 'approved') {
      return <Navigate to="/pending-approval" replace />;
    }

    return (
      <ProviderAwareLayout>
        <NotificationsPage />
      </ProviderAwareLayout>
    );
  }

  if (user?.role === 'secretary') {
    return (
      <SecretaryLayout>
        <NotificationsPage />
      </SecretaryLayout>
    );
  }

  return <Navigate to="/" replace />;
};

export default NotificationsRoute;
