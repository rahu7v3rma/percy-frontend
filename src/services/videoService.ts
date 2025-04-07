import { API_BASE_URL } from '@/config/api';
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';


// Error handling helper
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.message || error.message);
  }
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('An unexpected error occurred');
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

export interface Video {
  _id: string;
  title: string;
  description?: string;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  userId: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  uploader?: {
    username: string;
    email: string;
    role: string;
  };
  clientGroup?: {
    id: string;
    name: string;
  };
  campaigns?: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
  status: 'processing' | 'ready' | 'error';
  visibility: 'public' | 'private' | 'campaign';
  metadata?: Record<string, string>;
  views: number;
  shares: Array<{
    type: 'public' | 'private';
    accessCount: number;
    createdAt: Date;
    expiresAt?: Date;
    requireEmail: boolean;
    viewers: Array<{
      email: string;
      viewedAt: Date;
    }>;
  }>;
  settings?: {
    playerColor?: string;
    secondaryColor?: string;
    autoPlay?: boolean;
    showControls?: boolean;
    callToAction?: {
      enabled: boolean;
      title: string;
      description?: string;
      buttonText: string;
      buttonLink?: string;
      displayTime: number;
    };
  };
  analytics?: {
    viewSessions: Array<{
      sessionId: string;
      userId?: string;
      startTime: Date;
      endTime: Date;
      watchTime: number;
      completedQuarters: number[];
      quarters: Array<{
        quarter: number;
        position: number;
        timestamp: Date;
      }>;
      ctaClicked: boolean;
      viewerInfo: {
        ip: string;
        userAgent: string;
        country: string;
        city: string;
      };
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  file: File;
  thumbnail?: File;
  clientGroup?: string;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  thumbnail?: File;
  status?: 'processing' | 'ready' | 'error';
  visibility?: 'public' | 'private' | 'campaign';
  settings?: {
    playerColor?: string;
    secondaryColor?: string;
    autoPlay?: boolean;
    showControls?: boolean;
    callToAction?: {
      enabled: boolean;
      title: string;
      description?: string;
      buttonText: string;
      buttonLink?: string;
      displayTime: number;
    };
  };
}

// Get all videos
export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await api.get('/videos');
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error fetching videos');
  }
};

// Get specific video
export const getVideo = async (videoId: string): Promise<Video> => {
  try {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error fetching video');
  }
};

// Create new video
export const createVideo = async (data: CreateVideoData): Promise<Video> => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('file', data.file);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.clientGroup) formData.append('clientGroup', data.clientGroup);

    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error creating video');
  }
};

// Update video
export const updateVideo = async (videoId: string, data: UpdateVideoData): Promise<Video> => {
  try {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.status) formData.append('status', data.status);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.settings) formData.append('settings', JSON.stringify(data.settings));

    const response = await api.put(`/videos/${videoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating video:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error updating video');
  }
};

// Delete video
export const deleteVideo = async (videoId: string): Promise<void> => {
  try {
    await api.delete(`/videos/${videoId}`);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error deleting video');
  }
};

// Get video stream URL
export const getVideoStreamUrl = async (videoId: string): Promise<string> => {
  try {
    const response = await api.get(`/videos/${videoId}/stream`);
    return response.data.url;
  } catch (error) {
    console.error('Error getting video stream URL:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error getting video stream URL');
  }
};

// Upload video
export const uploadVideo = async (data: CreateVideoData): Promise<Video> => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('file', data.file);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.clientGroup) formData.append('clientGroup', data.clientGroup);

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error uploading video');
  }
};

// Associate video with client group
export const associateVideoWithGroup = async (videoId: string, groupId: string): Promise<Video> => {
  try {
    const response = await api.post(`/videos/${videoId}/associate-group`, { groupId });
    return response.data;
  } catch (error) {
    console.error('Error associating video with group:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error associating video with group');
  }
};

export default {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoStreamUrl,
  uploadVideo,
  associateVideoWithGroup,
};
