import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SecretaryProtectedRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'secretary') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SecretaryProtectedRoute;
