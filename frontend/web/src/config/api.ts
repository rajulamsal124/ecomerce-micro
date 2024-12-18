// API base URL configuration
export const API_BASE_URL = 'http://localhost:3001'; // Update this with your actual backend URL

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  PROFILE: `${API_BASE_URL}/users/profile`,
};
