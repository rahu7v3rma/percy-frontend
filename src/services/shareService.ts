import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

interface ShareLinkOptions {
  videoId: string;
  expiryDate?: number;
  requireEmail?: boolean;
}

interface EmailShareOptions extends ShareLinkOptions {
  recipientEmail: string;
  message?: string;
}

export const createShareLink = async (options: ShareLinkOptions) => {
  const token = localStorage.getItem('token');

  console.log('url share ---',`${API_BASE_URL}/share/create`)
  const response = await axios.post(
    `${API_BASE_URL}/share/create`,
    options,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log('response of share link')

  return response.data;
};

export const sendShareEmail = async (options: EmailShareOptions) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_BASE_URL}/share/email`,
    options,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getSharedVideo = async (token: string, email?: string) => {
  const url = email ? `${API_BASE_URL}/share/${token}?email=${email}` : `${API_BASE_URL}/share/${token}`;
  const response = await axios.get(url);
  return response.data;
};
