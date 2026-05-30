import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * A wrapper component that protects routes requiring authentication.
 * It checks the authentication status using the useAuth hook.
 * - If loading, it displays a simple loading spinner.
 * - If not authenticated, it redirects to the /login page.
 * - If authenticated, it renders the child routes using <Outlet />.
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a simple loading spinner while the auth state is being determined
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;