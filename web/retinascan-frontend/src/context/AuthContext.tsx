import React, { createContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import type { User } from '../types/auth';
import * as authService from '../services/authService';

/**
 * Interface defining the shape of the authentication context value.
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * The AuthContext itself, initialized as undefined to enforce use within a provider.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application to provide global auth state.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On mount, attempt to restore the user session from localStorage.
   */
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  /**
   * Calls the auth service to log in and updates the local state on success.
   * Rethrows the error so the calling component (like the Login form) can handle UI feedback.
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      // Error is caught by the UI component for toast notifications or field errors
      throw error;
    }
  };

  /**
   * Clears the user from state and invokes the backend logout sequence.
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * Memoize the context value to prevent unnecessary re-renders of consuming components.
   */
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};