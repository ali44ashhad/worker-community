import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MemberProtectedRoute = ({ children, requireCommunity = false }) => {
  const user = useSelector((state) => state.auth.user);
  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!['customer', 'provider'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const accountStatus = user.accountStatus || 'approved';
  if (accountStatus !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requireCommunity && !user.communityCommunName) {
    return <Navigate to="/community/update-profile" replace />;
  }

  return children;
};

export default MemberProtectedRoute;
