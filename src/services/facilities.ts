import api from './api';

export interface Facility {
  _id: string;
  name: string;
  type: string;
  username?: string;
  address?: string;
  phone?: string;
  email?: string;
  altPhone?: string[];
  services?: string[];
  openingHours?: string;
  ownership?: string;
  isEmergency?: boolean;
  isActive?: boolean;
  hospitalType?: string;
  pharmacyType?: string;
  notes?: string;
  location?: { type?: string; coordinates?: number[] };
}

export const listFacilities = async (params?: any): Promise<Facility[]> => {
  const res = await api.get('/api/facilities', { params });
  return res.data || [];
};

export const getFacility = async (id: string): Promise<Facility> => {
  const res = await api.get(`/api/facilities/${id}`);
  return res.data;
};

export const updateFacility = async (id: string, data: Partial<Facility>) => {
  const res = await api.put(`/api/facilities/${id}`, data);
  return res.data;
};

const facilitiesService = { listFacilities, getFacility, updateFacility };
export default facilitiesService;
