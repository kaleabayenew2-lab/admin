import { useState, useEffect } from 'react';
import api from '../services/api';
import { Facility, filterFacilities } from '../utils/facilityUtils';

export const useFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [completenessFilter, setCompletenessFilter] = useState<string>('all');

  const loadFacilities = async (retryCount = 0) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/facilities');
      setFacilities(res.data || []);
      setError('');
    } catch (err: any) {
      console.error('Failed to load facilities:', err);
      const msg = err?.response?.data?.error || err?.message || 'Failed to load facilities';
      if (msg.includes('Rate limited') || msg.includes('Too many requests')) {
        setError(msg);
      } else {
        setError('Failed to load facilities');
      }
    } finally {
      setLoading(false);
    }
  };

  const createFacility = async (facility: Partial<Facility>) => {
    try {
      setLoading(true);
      const response = await api.post('/api/facilities', facility);
      const createdFacility = response.data;
      
      // Reload the facilities list to get the updated data
      await loadFacilities();
      
      return { 
        success: true, 
        facility: createdFacility // Return the created facility with ID
      };
    } catch (err: any) {
      console.error('Failed to create facility', err);
      return { 
        success: false, 
        error: err?.response?.data?.error || 'Failed to create facility' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateFacility = async (id: string, updates: Partial<Facility>) => {
    try {
      setLoading(true);
      await api.put(`/api/facilities/${id}`, updates);
      await loadFacilities();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update facility', err);
      return { 
        success: false, 
        error: err?.response?.data?.error || 'Failed to update facility' 
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteFacility = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/api/facilities/${id}`);
      await loadFacilities();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to delete facility', err);
      return { 
        success: false, 
        error: err?.response?.data?.error || 'Failed to delete facility' 
      };
    } finally {
      setLoading(false);
    }
  };

  const resetFacilityPassword = async (id: string, password?: string) => {
    try {
      setLoading(true);
      const res = await api.post(`/api/facilities/${id}/reset-password`, password ? { password } : {});
      await loadFacilities();
      return { 
        success: true, 
        password: res?.data?.password 
      };
    } catch (err: any) {
      console.error('Failed to reset password', err);
      return { 
        success: false, 
        error: err?.response?.data?.error || 'Failed to reset password' 
      };
    } finally {
      setLoading(false);
    }
  };

  const toggleFacilityActive = async (id: string, isActive: boolean) => {
    try {
      setLoading(true);
      await api.put(`/api/facilities/${id}`, { isActive: !isActive });
      await loadFacilities();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to toggle facility status', err);
      return { 
        success: false, 
        error: err?.response?.data?.error || 'Failed to update status' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Get filtered facilities
  const filteredFacilities = filterFacilities(facilities, searchQuery, filter, completenessFilter);

  useEffect(() => {
    loadFacilities();
  }, []);

  return {
    // Data
    facilities,
    filteredFacilities,
    loading,
    error,
    searchQuery,
    filter,
    completenessFilter,
    
    // Actions
    loadFacilities,
    createFacility,
    updateFacility,
    deleteFacility,
    resetFacilityPassword,
    toggleFacilityActive,
    setSearchQuery,
    setFilter,
    setCompletenessFilter,
  };
};
