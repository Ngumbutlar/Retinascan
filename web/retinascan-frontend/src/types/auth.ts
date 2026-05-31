/**
 * Represents a healthcare facility.
 */
export interface Facility {
  id: number;
  name: string;
  location: string;
}

/**
 * Represents a user in the RetinaScan system.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  facility: string | null;
}

/**
 * Represents the response received after a successful login.
 */
export interface LoginResponse {
  access_token: string;
  user: User;
}

/**
 * Represents the credentials required for user login.
 */
export interface LoginCredentials {
  email: string;
  password: string;
  facility: string;
}
