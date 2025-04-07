import { API_BASE_URL } from '@/config/api';
import axios, { InternalAxiosRequestConfig } from 'axios';


// Error handling helper
const handleApiError = (error: any) => {
  const message = error.response?.data?.error || error.message || 'An error occurred';
  throw new Error(message);
};

// Configure axios to include credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Changed to false since we're using token auth
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  username: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'super-admin' | 'client-admin' | 'user';
  lastLogin?: Date;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalVideos: number;
  recentUsers: User[];
  recentVideos: Video[];
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnail?: string;
  views: number;
  createdAt: string;
  userId: string | {
    _id: string;
    username: string;
    email: string;
  };
}

// User Management
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId: string, status: User['status']): Promise<User> => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/admin/users/${userId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Video Management
export const getAdminVideos = async (): Promise<Video[]> => {
  try {
    const response = await api.get('/admin/videos');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getVideoById = async (videoId: string): Promise<Video> => {
  try {
    const response = await api.get(`/admin/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteVideo = async (videoId: string): Promise<void> => {
  try {
    await api.delete(`/admin/videos/${videoId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// System Statistics
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export default {
  getUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  getAdminVideos,
  getVideoById,
  deleteVideo,
  getSystemStats,
};
