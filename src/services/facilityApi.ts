// API service for fetching facility data from backend
export interface BackendFacility {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy';
  latitude: number;
  longitude: number;
  address?: string;
  email?: string;
  phone?: string;
  opening_hours?: string;
  ownership: 'private' | 'public';
  emergency?: boolean;
  notes?: string;
  hospital_type?: string;
  pharmacy_type?: string;
  services?: any[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy';
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  email?: string;
  phone?: string;
  openingHours?: string;
  ownership?: 'private' | 'public';
  isEmergency?: boolean;
  notes?: string;
  hospitalType?: string;
  pharmacyType?: string;
  services?: string[];
  isActive?: boolean;
  averageRating?: number;
  ratingCount?: number;
  viewsTotal?: number;
}

export interface FacilityApiResponse {
  success: boolean;
  data: BackendFacility[];
  count: number;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

export const facilityApi = {
  // Get all facilities
  async getFacilities(params?: {
    search?: string;
    type?: 'hospital' | 'pharmacy';
    ownership?: 'private' | 'public';
    emergency?: boolean;
  }): Promise<Facility[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) queryParams.append('search', params.search);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.ownership) queryParams.append('ownership', params.ownership);
      if (params?.emergency !== undefined) queryParams.append('emergency', params.emergency.toString());

      const response = await fetch(`${API_BASE_URL}/api/facilities?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Backend returns direct array, not wrapped object
      const facilities = Array.isArray(result) ? result : [];
      
      // Transform backend data to frontend format
      return facilities
        .filter(facility => facility.isActive !== false) // Only return active facilities
        .map(transformBackendToFrontend);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }
  },

  // Get single facility by ID
  async getFacility(id: string): Promise<Facility | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facilities?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        return null;
      }

      // Handle single facility case (result.data might be object or array)
      const facility = Array.isArray(result.data) ? result.data[0] : result.data;
      
      if (!facility || facility.is_active === false) {
        return null;
      }

      return transformBackendToFrontend(facility);
    } catch (error) {
      console.error('Error fetching facility:', error);
      throw error;
    }
  },

  // Record facility view
  async recordView(facilityId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/facilities/${facilityId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error recording facility view:', error);
      // Don't throw error for view recording - it's not critical
    }
  },

  // Rate facility
  async rateFacility(facilityId: string, rating: number): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/facilities/${facilityId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
    } catch (error) {
      console.error('Error rating facility:', error);
      throw error;
    }
  },
};

// Transform backend facility data to frontend format
function transformBackendToFrontend(backend: any): Facility {
  return {
    id: backend.id,
    name: backend.name,
    type: backend.type,
    location: backend.location ? {
      type: 'Point',
      coordinates: backend.location.coordinates, // Already in [longitude, latitude] format
    } : undefined,
    address: backend.address,
    email: backend.email,
    phone: backend.phone,
    openingHours: backend.openingHours,
    ownership: backend.ownership,
    isEmergency: backend.isEmergency,
    notes: backend.notes,
    hospitalType: backend.hospitalType,
    pharmacyType: backend.pharmacyType,
    services: backend.services || [],
    isActive: backend.isActive !== false, // Default to true if undefined
    averageRating: backend.averageRating || 0,
    ratingCount: backend.ratingCount || 0,
    viewsTotal: backend.viewsTotal || 0,
  };
}

export default facilityApi;
