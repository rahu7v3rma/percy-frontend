import { API_BASE_URL, getAuthHeaders, handleApiResponse, makeApiRequest } from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

// Fetch Folders
export const fetchRecentVideos: any = createAsyncThunk(
    "dashboard/fetchRecentVideos",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token;

            if (!token) throw new Error("Unauthorized");

            const response = await axios.get(`${API_BASE_URL}/videos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('response --- ',response);

            // Ensure we return an array even if the API doesn't return an array
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch workspaces";

            toast.error(message);

            return rejectWithValue(message);
        }
    }
);
