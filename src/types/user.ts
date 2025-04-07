export type UserRole = 'super_admin' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  createdBy?: string; // ID of the admin who created this user
  isActive: boolean;
  workspaces: string[]; // Array of workspace IDs
  lastLogin?: string;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  defaultWorkspace?: string;
}
