import { API_BASE_URL } from '@/config/api';
import axios from 'axios';


export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  email: string;
  joinedAt: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

class WorkspaceService {
  async createWorkspace(data: CreateWorkspaceDto) {
    const response = await axios.post(`${API_BASE_URL}/workspaces`, data);
    return response.data;
  }

  async getWorkspaces() {
    const response = await axios.get(`${API_BASE_URL}/workspaces`);
    return response.data;
  }

  async getWorkspace(id: string) {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${id}`);
    return response.data;
  }

  async updateWorkspace(id: string, data: Partial<CreateWorkspaceDto>) {
    const response = await axios.patch(`${API_BASE_URL}/workspaces/${id}`, data);
    return response.data;
  }

  async deleteWorkspace(id: string) {
    await axios.delete(`${API_BASE_URL}/workspaces/${id}`);
  }

  async getWorkspaceMembers(workspaceId: string) {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/members`);
    return response.data;
  }

  async inviteMember(workspaceId: string, email: string, role: 'admin' | 'member') {
    const response = await axios.post(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
      email,
      role
    });
    return response.data;
  }

  async removeMember(workspaceId: string, memberId: string) {
    await axios.delete(`${API_BASE_URL}/workspaces/${workspaceId}/members/${memberId}`);
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: 'admin' | 'member') {
    const response = await axios.patch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${memberId}`, {
      role
    });
    return response.data;
  }
}

export const workspaceService = new WorkspaceService();
