import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../interfaces';
import Spinner from '../components/common/Spinner';

// ============================================================
// ProtectedRoute: requires authentication
// ============================================================
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ============================================================
// RoleRoute: requires specific role(s)
// ============================================================
interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return hasRole(...allowedRoles) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// ============================================================
// GuestRoute: redirect authenticated users away from auth pages
// ============================================================
export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
