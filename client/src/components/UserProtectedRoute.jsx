import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserProtectedRoute = ({ children }) => {
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

  return children;
};

export default UserProtectedRoute;

