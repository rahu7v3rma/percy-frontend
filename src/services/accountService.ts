import api from './api';

export const deleteAccount = async (): Promise<{ message: string }> => {
  const response = await api.delete('/api/users/account/self');
  return response.data;
};
