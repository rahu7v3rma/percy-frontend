import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import axios, { AxiosError } from 'axios';

export interface ClientGroup {
  _id: string;
  name: string;
  description?: string;
  clientAdmins: Array<{
    _id: string;
    username: string;
    email: string;
    role: string;
  }>;
  users: Array<{
    _id: string;
    username: string;
    email: string;
    role: string;
  }>;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientGroupData {
  name: string;
  description?: string;
  clientAdmins?: string[];
  users?: string[];
}

export interface UpdateClientGroupData {
  name?: string;
  description?: string;
  clientAdmins?: string[];
  users?: string[];
  status?: 'active' | 'inactive';
}

// Get all client groups
export const getClientGroups = async (): Promise<ClientGroup[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/client-groups`, {
      withCredentials: true,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (axiosError.response.status === 401) {
          console.error('Authentication error: ', axiosError.response.data);
          throw new Error('You are not authenticated. Please log in.');
        } else if (axiosError.response.status === 403) {
          console.error('Permission error: ', axiosError.response.data);
          throw new Error('You do not have permission to access client groups.');
        } else if (axiosError.response.status === 404) {
          console.error('Not found error: ', axiosError.response.data);
          throw new Error('Client groups endpoint not found. Please check server configuration.');
        } else {
          console.error('Server error: ', axiosError.response.data);
          throw new Error(`Server error: ${JSON.stringify(axiosError.response.data) || 'Unknown error'}`);
        }
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Network error: ', axiosError.request);
        throw new Error('Network error. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error in request setup: ', axiosError.message);
        throw new Error(`Error: ${axiosError.message}`);
      }
    } else {
      // Not an Axios error
      console.error('Unknown error: ', error);
      throw new Error('An unknown error occurred');
    }
  }
};

// Get single client group
export const getClientGroup = async (id: string): Promise<ClientGroup> => {
  try {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    // Make sure we have fresh headers with the token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    const response = await axios.get(`${API_BASE_URL}/client-groups/${id}`, {
      withCredentials: true,
      headers
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Handle 401 errors explicitly
        if (axiosError.response.status === 401) {
          console.error('Authentication error: ', axiosError.response.data);
          // Redirect to login if token is invalid or expired
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        } else {
          console.error('Server error: ', axiosError.response.data);
          throw error;
        }
      }
    }
    console.error('Error fetching client group:', error);
    throw error;
  }
};

// Create new client group
export const createClientGroup = async (data: CreateClientGroupData): Promise<ClientGroup> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/client-groups`, data, {
      withCredentials: true,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating client group:', error);
    throw error;
  }
};

// Update client group
export const updateClientGroup = async (id: string, data: UpdateClientGroupData): Promise<ClientGroup> => {
  try {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    // Make sure we have fresh headers with the token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    const response = await axios.put(`${API_BASE_URL}/client-groups/${id}`, data, {
      withCredentials: true,
      headers
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Handle 401 errors explicitly
        if (axiosError.response.status === 401) {
          console.error('Authentication error: ', axiosError.response.data);
          // Redirect to login if token is invalid or expired
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        } else {
          console.error('Server error: ', axiosError.response.data);
          throw error;
        }
      }
    }
    console.error('Error updating client group:', error);
    throw error;
  }
};

// Delete client group
export const deleteClientGroup = async (id: string): Promise<void> => {
  try {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    // Make sure we have fresh headers with the token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    await axios.delete(`${API_BASE_URL}/client-groups/${id}`, {
      withCredentials: true,
      headers
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Handle 401 errors explicitly
        if (axiosError.response.status === 401) {
          console.error('Authentication error: ', axiosError.response.data);
          // Redirect to login if token is invalid or expired
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        } else {
          console.error('Server error: ', axiosError.response.data);
          throw error;
        }
      }
    }
    console.error('Error deleting client group:', error);
    throw error;
  }
}; 