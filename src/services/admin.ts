import api from './api';
import { compressImageFile } from './uploads';

export interface AdminAllResponse {
  stats: Record<string, any>;
  totals: { users: number; facilities: number; feedbacks: number; notifications: number };
  users: any[];
  facilities: any[];
  feedbacks: any[];
  notifications: any[];
}

export const getAll = async (): Promise<AdminAllResponse> => {
  const res = await api.get('/api/admin/all');
  return res.data;
};

export const getSettings = async () => {
  const res = await api.get('/api/admin/settings');
  return res.data;
};

export const updateSettings = async (data: any) => {
  const res = await api.put('/api/admin/settings', data);
  return res.data;
};

export const getEmergencies = async () => {
  const res = await api.get('/api/admin/emergencies');
  return res.data.facilities || [];
};

export const bulkUpdateEmergencies = async (ids: string[], isEmergency: boolean) => {
  const res = await api.post('/api/admin/emergencies/bulk', { ids, isEmergency });
  return res.data;
};

// Content management
export const getContent = async () => {
  const res = await api.get('/api/admin/content');
  return res.data.items || [];
};

export const createContent = async (data: any) => {
  const res = await api.post('/api/admin/content', data);
  return res.data.item;
};

export const updateContent = async (id: string, data: any) => {
  const res = await api.put(`/api/admin/content/${id}`, data);
  return res.data.item;
};

export const deleteContent = async (id: string) => {
  const res = await api.delete(`/api/admin/content/${id}`);
  return res.data;
};

export const getStats = async () => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

// Profile related
export const getProfile = async () => {
  try {
    const res = await api.get('/api/admin/profile');
    return res.data.profile;
  } catch (err) {
    return null;
  }
};

export const updateProfile = async (data: any) => {
  const res = await api.put('/api/admin/profile', data);
  return res.data.profile;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await api.post('/api/admin/profile/change-password', { currentPassword, newPassword });
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  try {
    const f = await compressImageFile(file, 800, 0.8);
    const fd = new FormData();
    fd.append('avatar', f);
    const res = await api.post('/api/admin/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  } catch (e) {
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await api.post('/api/admin/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  }
};

export const getApiKey = async () => {
  const res = await api.get('/api/admin/profile/api-key');
  return res.data.apiKey;
};

export const regenerateApiKey = async () => {
  const res = await api.post('/api/admin/profile/api-key/regenerate');
  return res.data.apiKey;
};

// Upload an asset used by settings (logo, banner)
export const uploadSettingAsset = async (file: File) => {
  try {
    const f = await compressImageFile(file, 1600, 0.85);
    const fd = new FormData();
    fd.append('file', f);
    const res = await api.post('/api/admin/settings/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  } catch (e) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/api/admin/settings/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  }
};

export const testSmtp = async (smtp: { host?: string; port?: number; user?: string; pass?: string }) => {
  const res = await api.post('/api/admin/settings/test-smtp', smtp);
  return res.data;
};

export const getMostViewed = async (limit = 50) => {
  const res = await api.get(`/api/admin/reports/most-viewed?limit=${limit}`);
  return res.data.items || [];
};

export const getTopRated = async (limit = 50) => {
  const res = await api.get(`/api/admin/reports/top-rated?limit=${limit}`);
  return res.data.items || [];
};

const adminService = {
  getAll,
  getSettings,
  updateSettings,
  getEmergencies,
  bulkUpdateEmergencies,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  getStats,
  // profile
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  uploadSettingAsset,
  testSmtp,
  getApiKey,
  regenerateApiKey,
  // reports
  getMostViewed,
  getTopRated,
};
export default adminService;
