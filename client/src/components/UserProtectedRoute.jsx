import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserProtectedRoute = ({ children, requireCommunity = false }) => {
  const user = useSelector((state) => state.auth.user);
  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);

  if (isCheckingAuth) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const accountStatus = user.accountStatus || 'approved';
  if (accountStatus !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requireCommunity && !user.communityCommunName) {
    return <Navigate to="/update-profile" replace />;
  }

  return children;
};

export default UserProtectedRoute;

