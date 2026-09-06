import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 1. Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Extract and normalize role/type from the user object (handles 'Admin' -> 'admin')
  const userRole = (user.role || user.type || '').toLowerCase();

  // 2. Check Role-Based Access Control (RBAC)
  const normalizedAllowedRoles = allowedRoles ? allowedRoles.map(r => r.toLowerCase()) : [];
  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. Render child route if authorized
  return <Outlet />;
};

export default ProtectedRoute;