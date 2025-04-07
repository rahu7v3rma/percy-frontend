// authSlice.ts
import { createSlice, createAsyncThunk, ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { createWorkspace, fetchWorkspaces } from './workspaceThunk';

type User = {
    _id: string;
    email: string;
};

export type Settings = {
    defaultVideoExpiry: number;
    requireEmailForVideos: boolean;
} & Record<string, unknown>; // This allows additional properties with unknown value types

export type Member = {
    userId: string;
    role: 'owner' | 'admin' | 'member';
};

export type WorkspaceObj = {
    createdAt: string;
    description: string;
    members: Member[];
    name: string;
    ownerId: string;
    settings: Settings;
    updatedAt: string;
    __v: number;
    _id: string;
};

export interface WorkspaceState {
    workspaces: WorkspaceObj[];
    currentWorkspace: WorkspaceObj | null;
    loading: boolean;
    error: string | null;
}

// Load the current workspace from localStorage if available
const loadCurrentWorkspace = () => {
    try {
        const savedWorkspace = localStorage.getItem('currentWorkspace');
        return savedWorkspace ? JSON.parse(savedWorkspace) : null;
    } catch (error) {
        console.error('Error loading workspace from localStorage:', error);
        return null;
    }
};

const initialState: WorkspaceState = {
    workspaces: [],
    currentWorkspace: loadCurrentWorkspace(), // Load from localStorage
    loading: false,
    error: null,
};


const workspaceBuilder = async (builder: ActionReducerMapBuilder<WorkspaceState>) => {
    builder
        .addCase(fetchWorkspaces.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchWorkspaces.fulfilled, (state, action) => {
            state.loading = false;
            
            // Ensure action.payload is an array
            const workspaces = Array.isArray(action.payload) ? action.payload : [];
            state.workspaces = workspaces;
            
            // If we have a currentWorkspace from localStorage, verify it exists in the loaded workspaces
            if (state.currentWorkspace) {
                const workspaceExists = workspaces.some((workspace: WorkspaceObj) => 
                    workspace._id === state.currentWorkspace?._id
                );
                
                // If the saved workspace no longer exists (was deleted or user lost access)
                if (!workspaceExists) {
                    // Set to the first available workspace if any exist
                    if (workspaces.length > 0) {
                        state.currentWorkspace = workspaces[0];
                        localStorage.setItem('currentWorkspace', JSON.stringify(workspaces[0]));
                    } else {
                        state.currentWorkspace = null;
                        localStorage.removeItem('currentWorkspace');
                    }
                }
            } 
            // If no current workspace is set but we have workspaces, set the first one
            else if (!state.currentWorkspace && workspaces.length > 0) {
                state.currentWorkspace = workspaces[0];
                // Save to localStorage
                localStorage.setItem('currentWorkspace', JSON.stringify(workspaces[0]));
            }
        })
        .addCase(fetchWorkspaces.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}

const createWorkspaceBuilder = async (builder: ActionReducerMapBuilder<WorkspaceState>) => {
    builder
        .addCase(createWorkspace.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createWorkspace.fulfilled, (state, action) => {
            console.log('action payload --- ', action.payload)
            state.loading = false;
            // Append the new workspace to the list
            if (action.payload && typeof action.payload === 'object' && '_id' in action.payload) {
                // Make sure we're dealing with a valid workspace object
                const workspace = action.payload as WorkspaceObj;
                state.workspaces.push(workspace);
                state.currentWorkspace = workspace;
                // Save to localStorage
                localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
            }
            // state.workspaces = action.payload;
        })
        .addCase(createWorkspace.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
}

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = action.payload;
            // Save to localStorage whenever it changes
            if (action.payload) {
                localStorage.setItem('currentWorkspace', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('currentWorkspace');
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        workspaceBuilder(builder)
        createWorkspaceBuilder(builder)

    },
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;