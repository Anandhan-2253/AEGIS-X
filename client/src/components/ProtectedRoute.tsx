import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { routeForRole } from '../utils/roleRoutes';
import { LoadingSpinner } from './LoadingSpinner';

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Authorizing session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={routeForRole(user.role)} replace />;
  }

  return children;
}
