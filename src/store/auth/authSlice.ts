// authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { getProfile, googleLogin, login, register } from './authThunk';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'super-admin' | 'client-admin' | 'user';
  clientGroup?: {
    _id: string;
    name: string;
  } | string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
};


const registerBuilder = async (builder) => {
  builder
    .addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      toast.success('Registration successful!');
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
}

const loginBuilder = async (builder) => {
  builder
    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {

      console.log('user data --- ',)
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      toast.success('Login successful!');
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
}

const googleLoginBuilder = async (builder) => {
  builder
    .addCase(googleLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(googleLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      toast.success('Google Login successful!');
    })
    .addCase(googleLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
}

const getProfileBuilder = async (builder) => {
  builder
    .addCase(getProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(getProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase(getProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
}


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    registerBuilder(builder),
      loginBuilder(builder),
      googleLoginBuilder(builder),
      getProfileBuilder(builder)
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;