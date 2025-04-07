// Development vs Production API URL setup
// Use relative URL in development to leverage proxy, or direct to backend dev server
const isDevelopment = window.location.hostname === 'localhost';

// For development, point to the actual backend server URL
const DEV_API_URL = isDevelopment ? 'http://localhost:3000/api' : 'https://app.hey-percy.com/api';
// Use domain based on environment
export const domain = isDevelopment ? "http://localhost:3000/" : "https://app.hey-percy.com/";

// Use the appropriate API base URL based on environment
export const API_BASE_URL = DEV_API_URL;
// Domain URL for assets and other resources
export const API_URL = domain;

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Accept': 'application/json'
});

// Function to determine if a path is an S3 URL or needs the domain prepended
export const getFullUrl = (path: string) => {
  if (!path) return '';
  // If already a full URL (including S3 URLs), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise prepend the domain
  return `${API_URL}${path.startsWith('/') ? path.substring(1) : path}`;
};

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

export const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
    credentials: 'include',
    mode: 'cors'
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    return handleApiResponse(response);
  } catch (error) {
    console.error(`API request failed for endpoint ${endpoint}:`, error);
    throw error;
  }
};
