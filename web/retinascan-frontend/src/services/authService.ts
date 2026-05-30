import api from './api';
import type { LoginCredentials, LoginResponse, User } from '../types/auth';

/**
 * Handles user login by sending credentials to the backend.
 * On successful login, it stores the access token ('retinascan_token') and
 * user information ('retinascan_user' as a JSON string) in localStorage.
 * @param credentials An object containing the user's email and password.
 * @returns A promise that resolves with the full login response data.
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  
  if (response.data.access_token && response.data.user) {
    localStorage.setItem('retinascan_token', response.data.access_token);
    localStorage.setItem('retinascan_user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Handles user logout.
 * It sends a POST request to the backend's /auth/logout endpoint (with the token
 * in the Authorization header via the Axios interceptor). Regardless of the
 * backend's response, it clears all authentication-related data from localStorage
 * and then redirects the user to the /login page.
 */
export const logout = async (): Promise<void> => {
  try {
    // Optionally, inform the backend about the logout to invalidate the token server-side
    await api.post('/auth/logout');
  } catch (error) {
    // Log the error but proceed with local logout, as the primary goal is to clear client-side state.
    console.error('Backend logout failed, but clearing local storage anyway:', error);
  } finally {
    localStorage.removeItem('retinascan_token');
    localStorage.removeItem('retinascan_user');
    window.location.href = '/login'; // Redirect to login page
  }
};

/**
 * Retrieves the current authenticated user's information from localStorage.
 * It reads the 'retinascan_user' item, parses it from a JSON string to a User object.
 * @returns The User object if found and successfully parsed, otherwise null.
 */
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem('retinascan_user');
  if (userString) {
    try {
      return JSON.parse(userString) as User;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  }
  return null;
};

/**
 * Fetches the list of available healthcare facilities from the backend.
 * @returns A promise that resolves to an array of facility names.
 */
export const getFacilities = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/auth/facilities');
  return response.data;
};
