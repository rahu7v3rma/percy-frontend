// authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { FolderType } from '@/types/folders';
import { fetchRecentVideos } from './dashboardThunk';
import { Video } from '@/types/videos';

export interface dashboardState {
    recentVideos: Video[];
    loading: boolean;
    error: string | null;
}

const initialState: dashboardState = {
    recentVideos: [],
    loading: false,
    error: null,
};


const dashboardBuilder = async (builder) => {
    builder
        .addCase(fetchRecentVideos.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchRecentVideos.fulfilled, (state, action) => {
            console.log('folder action paylaod --- ', action.payload)
            state.loading = false;
            state.recentVideos = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchRecentVideos.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setRecentVideos: (state, action) => {
            state.recentVideos = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        dashboardBuilder(builder)

    },
});

export const { setRecentVideos } = dashboardSlice.actions;
export default dashboardSlice.reducer;