import { API_BASE_URL } from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

export const register = createAsyncThunk(
    'auth/register',
    async (credentials: { username: string; email: string; password: string }, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials);
        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  );
  
  export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        // Store token immediately after successful login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  );
  
  export const googleLogin = createAsyncThunk('auth/google-login',
    async (credentials: {
      firstName: string;
      lastName: string,
      email: string,
      image: string,
      googleId: string,
      credential: any,
    }, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/google-login`, credentials);
        // Store token immediately after successful login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  )
  
  export const getProfile = createAsyncThunk(
    'auth/profile',
    async (_, { getState, rejectWithValue }: any) => {
      try {
        const token = getState().auth.token;
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        return rejectWithValue(message);
      }
    }
  );