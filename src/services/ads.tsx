import api from './api';

export async function listAds() {
  const res = await api.get('/api/ads');
  return res.data;
}

export async function getAd(id: string) {
  const res = await api.get(`/api/ads/${id}`);
  return res.data;
}

export async function createAd(payload: any) {
  const res = await api.post('/api/ads', payload);
  return res.data;
}

export async function updateAd(id: string, payload: any) {
  const res = await api.put(`/api/ads/${id}`, payload);
  return res.data;
}

export async function deleteAd(id: string) {
  const res = await api.delete(`/api/ads/${id}`);
  return res.data;
}

export async function reorderAds(order: Array<string>) {
  // simple helper that posts order array to admin endpoint (optional)
  const res = await api.post('/api/admin/ads/reorder', { order });
  return res.data;
}
