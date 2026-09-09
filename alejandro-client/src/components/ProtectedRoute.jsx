import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  const userRole = (user.role || user.type || '').toLowerCase();

  const normalizedAllowedRoles = allowedRoles ? allowedRoles.map(r => r.toLowerCase()) : [];
  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;