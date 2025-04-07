import { API_BASE_URL } from '@/config/api';
import api from './api';
import axios from 'axios';

export interface Campaign {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  startDate?: Date;
  endDate?: Date;
  createdBy: {
    _id: string;
    username: string;
  };
  clientGroup: {
    _id: string;
    name: string;
  };
  assignedUsers: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: 'participant' | 'viewer' | 'admin';
    assignedAt: Date;
  }>;
  videos: Array<{
    _id: string;
    title: string;
    thumbnail?: string;
    filePath?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  clientGroup?: string;
  assignedUsers: Array<{
    user: string;
    role: 'participant' | 'viewer' | 'admin';
  }>;
  videos?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  assignedUsers?: Array<{
    user: string;
    role: 'participant' | 'viewer' | 'admin';
  }>;
  videos?: string[];
  status?: 'active' | 'inactive' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

// Get all campaigns
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    console.log('Making request to:', `${API_BASE_URL}/campaigns`);
    const response = await api.get('/campaigns');
    console.log('Campaigns response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error fetching campaigns');
  }
};

// Get specific campaign
export const getCampaign = async (campaignId: string): Promise<Campaign> => {
  try {
    const response = await api.get(`/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error fetching campaign');
  }
};

// Create new campaign
export const createCampaign = async (data: CreateCampaignData): Promise<Campaign> => {
  try {
    const response = await api.post('/campaigns', data);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error creating campaign');
  }
};

// Update campaign
export const updateCampaign = async (campaignId: string, data: UpdateCampaignData): Promise<Campaign> => {
  try {
    const response = await api.put(`/campaigns/${campaignId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error updating campaign');
  }
};

// Delete campaign
export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    await api.delete(`/campaigns/${campaignId}`);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw new Error(axios.isAxiosError(error) ? error.response?.data?.message : 'Error deleting campaign');
  }
}; 