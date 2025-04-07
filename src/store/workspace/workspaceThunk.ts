import { API_BASE_URL, getAuthHeaders, handleApiResponse, makeApiRequest } from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

// Fetch Workspaces
export const fetchWorkspaces: any = createAsyncThunk(
    "workspace/fetchWorkspaces",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token || localStorage.getItem("token");
            
            if (!token) {
                toast.message("Session Expired");
                localStorage.clear()
                // handleLogout should be handled in the UI, not here
                return rejectWithValue("Session expired");
            }

            const response = await axios.get(`${API_BASE_URL}/workspaces`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            // Ensure we return an array
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            console.error("Error fetching workspaces:", error);
            const message = error.response?.data?.message || "Failed to fetch workspaces";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Create Workspace
export const createWorkspace: any = createAsyncThunk(
    "workspace/createWorkspace",
    async (workspaceName: string, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized");

            const tokenData = JSON.parse(atob(token.split(".")[1]));
            if (!tokenData.email) {
                toast.message("Session Expired");
                localStorage.clear()
                // handleLogout should be handled in the UI, not here
                return rejectWithValue("Session expired");
            }

            const response = await axios.post(
                `${API_BASE_URL}/workspaces`, 
                {
                    name: workspaceName.trim(),
                    description: "", // Optional description
                    settings: {
                        requireEmailForVideos: false,
                        defaultVideoExpiry: 7,
                    },
                },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`, 
                        "Content-Type": "application/json" 
                    },
                    withCredentials: true
                }
            );

            toast.success("Workspace created successfully");
            return response.data;
        } catch (error: any) {
            console.error("Workspace creation error:", error);
            const message = error.response?.data?.message || "Failed to create workspace";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);
