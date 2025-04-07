// authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { createFolder, deleteFolder, deleteVideo, fetchFolderContent, fetchFolders } from './folderThunk';
import { FolderType } from '@/types/folders';
// import { createWorkspace,  } from './workspaceThunk';

export interface FolderState {
    folders: FolderType[];
    folderContent:any;
    loading: boolean;
    error: string | null;
}

const initialState: FolderState = {
    folders: [],
    folderContent: [],
    loading: false,
    error: null,
};


const folderBuilder = async (builder) => {
    builder
        .addCase(fetchFolders.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchFolders.fulfilled, (state, action) => {
            console.log('folder action paylaod --- ', action.payload)
            state.loading = false;
            state.folders = action.payload;
        })
        .addCase(fetchFolders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}
const folderContentBuilder = async (builder) => {
    builder
        .addCase(fetchFolderContent.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchFolderContent.fulfilled, (state, action) => {
            console.log('folder action paylaod --- ', action.payload)
            state.loading = false;
            state.folderContent = action.payload;
        })
        .addCase(fetchFolderContent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}


const createFolderBuilder = async (builder) => {
    builder
        .addCase(createFolder.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createFolder.fulfilled, (state, action) => {
            console.log('action payload --- ', action.payload)
            if (action.payload) {
                state.folders = [...state.folders, action.payload]; // Append new folder correctly
            }
            state.loading = false;
        })
        .addCase(createFolder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}
const deleteFolderBuilder = async (builder) => {
    builder
        .addCase(deleteFolder.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteFolder.fulfilled, (state, action) => {
            console.log('action payload --- ', action.payload)
            state.folders = state.folders.filter(folder => folder._id !== action.payload); // Remove deleted folder
            state.loading = false;
        })
        .addCase(deleteFolder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}

const deleteVideoBuilder = async (builder) => {
    builder
        .addCase(deleteVideo.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteVideo.fulfilled, (state, action) => {
            console.log('action payload --- ', action.payload)
            console.log('folder content --- ',state.folderContent)
            // state.folders = state.folders.filter(folder => folder._id !== action.payload); // Remove deleted folder
            // state.loading = false;
        })
        .addCase(deleteVideo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}


const folderSlice = createSlice({
    name: 'folders',
    initialState,
    reducers: {
        setFolders: (state, action) => {
            state.folders = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        folderBuilder(builder)
        createFolderBuilder(builder)
        folderContentBuilder(builder)
        deleteFolderBuilder(builder)
        deleteVideoBuilder(builder)
    },
});

export const { setFolders } = folderSlice.actions;
export default folderSlice.reducer;