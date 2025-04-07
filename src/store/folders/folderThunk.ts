import { API_BASE_URL, getAuthHeaders, handleApiResponse, makeApiRequest } from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

// Fetch Folders
export const fetchFolders: any = createAsyncThunk(
    "folders/fetchFolders",
    async (workspace_id: string, { getState, rejectWithValue }) => {
        try {
            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token;

            if (!token) throw new Error("Unauthorized");

            const response = await axios.get(`${API_BASE_URL}/folders/workspace/${workspace_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch workspaces";

            toast.error(message);

            return rejectWithValue(message);
        }
    }
);

// Fetch Folders
export const fetchFolderContent: any = createAsyncThunk(
    "folders/fetchFolderContent",
    async (folderId: string, { getState, rejectWithValue }) => {
        try {
            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token;
            console.log('folderId ---- ', folderId)

            if (!token) throw new Error("Unauthorized");

            const response = await axios.get(`${API_BASE_URL}/folders/${folderId}/contents`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('folder contentt response ---- ',response)
            
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch workspaces";

            toast.error(message);

            return rejectWithValue(message);
        }
    }
);

interface createFolder {
    newFolderName : string;
    workspace_id : string;
}

// Create Folders
export const createFolder: any = createAsyncThunk(
    "folders/createFolder",
    async ({ newFolderName, workspace_id }: { newFolderName: string; workspace_id: string }, { getState, rejectWithValue }) => {
        try {
            console.log("workspace id ----- ", workspace_id);
            console.log("newFolderName ----- ", newFolderName);

            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token;
            const user_id = state.auth?.user?._id;

            if (!token) throw new Error("Unauthorized");

            const tokenData = JSON.parse(atob(token.split(".")[1]));
            if (!tokenData.email) {
                toast.message("Session Expired");
                localStorage.clear()
                return rejectWithValue("Session expired");
            }

            const newFolder = await makeApiRequest("/folders", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newFolderName,
                    workspaceId: workspace_id,
                    createdBy: user_id,
                }),
            });

            console.log('new folder ---- ',newFolder)

            toast.success("Folder created successfully");

            return newFolder;
        } catch (error: any) {
            console.error("Folder creation error:", error);
            const message = error.response?.data?.message || "Failed to create Folder";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Delete Folders
export const deleteFolder: any = createAsyncThunk(
    "folders/deleteFolder",
    async ({ folderId }: {  folderId: string }, { getState, rejectWithValue }) => {
        try {
            console.log("newFolderName ----- ", folderId);

            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token;

            if (!token) throw new Error("Unauthorized");

            const tokenData = JSON.parse(atob(token.split(".")[1]));
            if (!tokenData.email) {
                toast.message("Session Expired");
                localStorage.clear()

                return rejectWithValue("Session expired");
            }

            const newFolder = await makeApiRequest(`/folders/${folderId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            toast.success("Folder deleted successfully");


            return folderId;
        } catch (error: any) {
            console.error("Folder creation error:", error);
            const message = error.response?.data?.message || "Failed to delete Folder";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Delete Folders
export const deleteVideo: any = createAsyncThunk(
    "folders/deleteVideo",
    async ({ videoId }: {  videoId: string }, { getState, rejectWithValue }) => {
        try {
            console.log("newFolderName ----- ", videoId);

            const state: any = getState(); // Ensure state is typed correctly
            const token = state.auth?.token;

            if (!token) throw new Error("Unauthorized");

            const tokenData = JSON.parse(atob(token.split(".")[1]));
            if (!tokenData.email) {
                toast.message("Session Expired");
                localStorage.clear()
                return rejectWithValue("Session expired");
            }

            const newVideo = await makeApiRequest(`/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            toast.success("Folder deleted successfully");


            return videoId;
        } catch (error: any) {
            console.error("Folder creation error:", error);
            const message = error.response?.data?.message || "Failed to delete Folder";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);
