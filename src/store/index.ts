import { configureStore } from '@reduxjs/toolkit';
import videosReducer from './slices/videoSlice';
import authReducer from './auth/authSlice';
import workspaceReducer from './workspace/workspaceSlice';
import folderReducer from './folders/folderSlice';
import dashboardReducer from './dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    dashboard : dashboardReducer,
    videos: videosReducer,
    auth: authReducer,
    workspace: workspaceReducer,
    folders: folderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
