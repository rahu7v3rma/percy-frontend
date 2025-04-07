import api from './api';

export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  passwordExpiry: number;
  sessionTimeout: number;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
}

export interface SystemSettings {
  maxVideoSize: number;
  allowedFileTypes: string;
  maxStoragePerUser: number;
  autoDeleteInactiveDays: number;
}

export interface AllSettings {
  security?: SecuritySettings;
  email?: EmailSettings;
  system?: SystemSettings;
}

export const getSettings = async (): Promise<AllSettings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (
  type: 'security' | 'email' | 'system',
  settings: SecuritySettings | EmailSettings | SystemSettings
): Promise<{ message: string }> => {
  const response = await api.put(`/settings/${type}`, { settings });
  return response.data;
};

export const testEmailConfiguration = async (emailSettings: EmailSettings): Promise<{ message: string }> => {
  const response = await api.post('/settings/test-email', emailSettings);
  return response.data;
};
