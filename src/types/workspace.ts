export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  ownerId: string;
  members: WorkspaceMember[];
  videos: string[]; // Array of video IDs
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'member';
  expiresAt: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'expired';
}
