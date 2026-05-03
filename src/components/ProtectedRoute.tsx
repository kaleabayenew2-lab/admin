import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const auth = useAuth();
  if (auth.isAuthenticated) return <>{children}</>;
  return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
}
