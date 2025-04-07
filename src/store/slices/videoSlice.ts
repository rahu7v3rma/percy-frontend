import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '..';
import { API_BASE_URL } from '@/config/api';

const API_URL = `${API_BASE_URL}/videos`;

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  views: number;
  userId: string;
  createdAt: string;
}

interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  loading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
};

// Helper function to get auth header
const getAuthHeader = (getState: () => RootState) => {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

export const createVideo = createAsyncThunk(
  'videos/createVideo',
  async (videoData: Omit<Video, '_id' | 'views' | 'createdAt' | 'userId'>, { getState }) => {
    const response = await axios.post(API_URL, videoData, {
      headers: getAuthHeader(getState as () => RootState)
    });
    return response.data;
  }
);

export const incrementViews = createAsyncThunk(
  'videos/incrementViews',
  async (id: string, { getState }) => {
    const response = await axios.patch(`${API_URL}/${id}/views`, {}, {
      headers: getAuthHeader(getState as () => RootState)
    });
    return response.data;
  }
);

export const deleteVideo = createAsyncThunk(
  'videos/deleteVideo',
  async (id: string, { getState }) => {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(getState as () => RootState)
    });
    return id;
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Videos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch videos';
      })
      // Fetch Single Video
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch video';
      })
      // Create Video
      .addCase(createVideo.fulfilled, (state, action) => {
        state.videos.unshift(action.payload);
      })
      // Increment Views
      .addCase(incrementViews.fulfilled, (state, action) => {
        const updatedVideo = action.payload;
        if (state.currentVideo?._id === updatedVideo._id) {
          state.currentVideo = updatedVideo;
        }
        const index = state.videos.findIndex(v => v._id === updatedVideo._id);
        if (index !== -1) {
          state.videos[index] = updatedVideo;
        }
      })
      // Delete Video
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos = state.videos.filter(video => video._id !== action.payload);
        if (state.currentVideo?._id === action.payload) {
          state.currentVideo = null;
        }
      });
  },
});

export default videoSlice.reducer;
