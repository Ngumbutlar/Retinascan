import axios from 'axios';

// Create an Axios instance with a base URL from environment variables.
// It defaults to 'http://localhost:8000' if the environment variable is not set.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

/**
 * Request interceptor to add the Authorization header with a JWT token.
 * Reads the token from localStorage using the key 'retinascan_token' and
 * attaches it to outgoing requests if available.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retinascan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set multipart/form-data with boundary for file uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle 401 Unauthorized errors.
 * If a 401 status is received, it clears authentication data from localStorage
 * ('retinascan_token' and 'retinascan_user') and redirects the user to the login page.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('retinascan_token');
      localStorage.removeItem('retinascan_user');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;
