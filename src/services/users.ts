import api from './api';

export interface AdminUser {
  _id: string;
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  telegramUsername?: string;
  roles?: string[];
  isActive?: boolean;
  userId?: string;
  systemId?: string;
}

export const getUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get('/api/users');
  return res.data.users || [];
};

export const getUser = async (id: string): Promise<AdminUser | null> => {
  const res = await api.get(`/api/users/${encodeURIComponent(id)}`);
  return res.data.user || null;
};

export const updateUser = async (id: string, data: Partial<AdminUser>) => {
  const res = await api.put(`/api/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
};

export const resetPassword = async (id: string) => {
  const res = await api.post(`/api/users/${id}/reset-password`);
  return res.data;
};

const usersService = {
  getUsers,
  updateUser,
  deleteUser,
  resetPassword,
  getUser,
};
export default usersService;
