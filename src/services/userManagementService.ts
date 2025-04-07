import { API_BASE_URL } from '@/config/api';
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

// Error handling helper
const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  throw new Error(message);
};

// Configure axios to include credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'super-admin' | 'client-admin' | 'user';
  status: 'active' | 'suspended' | 'banned';
  clientId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientAdminResponse {
  message: string;
  token: string;
  user: User;
}

// Super Admin Functions
export const createClientAdmin = async (data: { username: string; email: string; password: string }): Promise<CreateClientAdminResponse> => {
  try {
    console.log('Creating client admin with data:', data);
    const response = await api.post('/users/client-admin', data);
    return response.data;
  } catch (error) {
    console.error('Error creating client admin:', error);
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.message || 'User already exists');
    }
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error creating client admin');
  }
};

// Client Admin Functions
export const createUser = async (data: { username: string; email: string; password: string; clientId?: string }): Promise<User> => {
  try {
    const response = await api.post('/users/user', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Common Functions
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserStatus = async (userId: string, status: User['status']): Promise<User> => {
  try {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  createClientAdmin,
  createUser,
  getUsers,
  updateUserStatus,
  deleteUser,
};
