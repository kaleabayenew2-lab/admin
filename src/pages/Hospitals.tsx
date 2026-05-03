import React, { useEffect, useState } from 'react';
import { FiSearch, FiEdit2, FiToggleLeft, FiToggleRight, FiPhone, FiMapPin, FiClock, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackendError from '../components/BackendError';
import NoDataFound from '../components/NoDataFound';
import FacilityDetailsDialog from '../components/FacilityDetailsDialog';
import CreateFacilityPopup from '../components/CreateFacilityPopup';
import ConfirmDialog from '../components/ConfirmDialog';
import { Facility, isComplete, copyToClipboard, getMissingKeys, HOSPITAL_SERVICE_MAP, PHARMACY_SERVICE_MAP, ALL_SERVICE_OPTIONS } from '../utils/facilityUtils';

interface Hospital {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  services?: string[];
  isActive: boolean;
  location?: {
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export default function Hospitals() {
  const [items, setItems] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showFacilityDialog, setShowFacilityDialog] = useState(false);
  const [lastSavedPassword, setLastSavedPassword] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [defaultTab, setDefaultTab] = useState<string>('hospital');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmColor: 'primary'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Apply blur effect when page loads
    setIsBlurred(true);
    const timer = setTimeout(() => setIsBlurred(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/facilities');
        if (!mounted) return;
        setItems((res.data || []).filter((f: any) => f.type === 'hospital'));
      } catch (err:any) {
        console.error(err);
        setError(err?.response?.data?.error || 'Failed to load hospitals');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    (it.address && it.address.toLowerCase().includes(search.toLowerCase())) ||
    (it.phone && it.phone.includes(search))
  );

  const handleToggleActive = async (hospital: Hospital) => {
    const action = hospital.isActive ? 'Deactivate' : 'Activate';
    const hospitalId = hospital._id || hospital.id;
    
    if (!hospitalId) {
      console.error('Hospital ID is missing:', hospital);
      alert('Hospital ID is missing. Cannot update status.');
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: `${action} Hospital`,
      message: `Are you sure you want to ${action.toLowerCase()} "${hospital.name}"?`,
      confirmColor: hospital.isActive ? 'error' : 'success',
      onConfirm: async () => {
        try {
          await api.put(`/api/facilities/${hospitalId}`, { isActive: !hospital.isActive });
          setItems(prev => prev.map(item => 
            (item._id === hospital._id || item.id === hospital.id) ? { ...item, isActive: !hospital.isActive } : item
          ));
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error) {
          console.error('Error toggling hospital:', error);
          alert('Failed to update hospital status');
        }
      }
    });
  };

  const handleViewDetails = (hospital: Hospital) => {
    // Convert Hospital to Facility type and show details dialog
    const facility: Facility = {
      _id: hospital._id,
      name: hospital.name,
      type: 'hospital',
      address: hospital.address,
      phone: hospital.phone || '',
      email: hospital.email || '',
      services: hospital.services || [],
      openingHours: hospital.openingHours || '',
      isActive: hospital.isActive,
      location: hospital.location
    };
    setSelectedFacility(facility);
    setShowFacilityDialog(true);
  };

  const handleEdit = (hospital: Hospital) => {
    // Convert Hospital to Facility type and navigate to edit mode
    const facility: Facility = {
      _id: hospital._id,
      name: hospital.name,
      type: 'hospital',
      address: hospital.address,
      phone: hospital.phone || '',
      email: hospital.email || '',
      services: hospital.services || [],
      openingHours: hospital.openingHours || '',
      isActive: hospital.isActive,
      location: hospital.location
    };
    navigate('/map', { state: { editFacility: facility } });
  };

  const handleFacilityUpdate = (facility: Facility) => {
    // Update the facility in the local state by converting back to Hospital type
    setItems(prev => prev.map(item => 
      item._id === facility._id ? { 
        ...item, 
        name: facility.name,
        address: facility.address,
        phone: facility.phone,
        email: facility.email,
        services: facility.services,
        openingHours: facility.openingHours,
        isActive: facility.isActive,
        location: facility.location
      } : item
    ));
  };

  const handleFacilitySave = async (facility: Facility) => {
    try {
      // Save the facility to the backend
      await api.put(`/api/facilities/${facility._id}`, facility);
      setItems(prev => prev.map(item => 
        item._id === facility._id ? { 
          ...item, 
          name: facility.name,
          address: facility.address,
          phone: facility.phone,
          email: facility.email,
          services: facility.services,
          openingHours: facility.openingHours,
          isActive: facility.isActive,
          location: facility.location
        } : item
      ));
      setShowFacilityDialog(false);
    } catch (error) {
      console.error('Error saving facility:', error);
      alert('Failed to save facility');
    }
  };

  const handleResetPassword = async (facility: Facility) => {
    try {
      const response = await api.post(`/api/facilities/${facility._id}/reset-password`);
      if (response.data.password) {
        setTempPassword(response.data.password);
        setLastSavedPassword(response.data.password);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const handleToggleActiveFacility = async (facility: Facility) => {
    try {
      const facilityId = facility._id || facility.id;
      if (!facilityId) {
        console.error('Facility ID is missing:', facility);
        alert('Facility ID is missing. Cannot update status.');
        return;
      }
      
      await api.put(`/api/facilities/${facilityId}`, { isActive: !facility.isActive });
      setItems(prev => prev.map(item => 
        (item._id === facility._id || item.id === facility.id) ? { ...item, isActive: !item.isActive } : item
      ));
    } catch (error) {
      console.error('Error toggling facility:', error);
      alert('Failed to update facility status');
    }
  };

  const handleCopyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label || 'Text'} copied to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleCreateNewHospital = () => {
    setDefaultTab('hospital');
    setShowCreatePopup(true);
  };

  const handleCreateFacility = async (facility: any) => {
    try {
      setLoading(true);
      const response = await api.post('/api/facilities', facility);
      if (response.data) {
        setItems(prev => [...prev, response.data]);
        setShowCreatePopup(false);
        // Show success message
        alert('Hospital created successfully!');
      }
    } catch (error) {
      console.error('Error creating facility:', error);
      alert('Failed to create hospital');
    } finally {
      setLoading(false);
    }
  };

  // Handle error states
  if (error) {
    const isNetworkError = error.includes('Network Error') || error.includes('ERR_NETWORK') || error.includes('timeout');
    if (isNetworkError) {
      return (
        <BackendError 
          onRetry={() => {
            setLoading(true);
            setError(null);
            api.get('/api/facilities')
              .then(res => setItems((res.data || []).filter((f: any) => f.type === 'hospital')))
              .catch(err => setError(err?.response?.data?.error || 'Failed to load hospitals'))
              .finally(() => setLoading(false));
          }}
          isRetrying={false}
          error={error}
        />
      );
    }
    return (
      <div id="main" className={`p-4 transition-all duration-500 ${isBlurred ? 'blur-sm' : ''}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="main" className={`p-4 transition-all duration-500 ${isBlurred ? 'blur-sm' : ''}`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏥 Hospital Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor all healthcare facilities in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hospitals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
            </div>
            <div className="text-3xl">🏥</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {items.filter(h => h.isActive).length}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {items.filter(h => !h.isActive).length}
              </p>
            </div>
            <div className="text-3xl">⏸️</div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center max-w-md">
          <span className="mr-2 text-gray-500"><FiSearch /></span>
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search hospitals by name, address, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateNewHospital}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          title="Add a new hospital to the system"
        >
          + Add New Hospital
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading hospitals...</span>
        </div>
      )}

      {/* No Data State */}
      {!loading && filtered.length === 0 && (
        <NoDataFound 
          onCreateNew={handleCreateNewHospital}
          title="No Hospitals Found"
          message="There are no hospitals available at the moment."
          buttonText="Add New Hospital"
          icon="🏥"
        />
      )}

      {/* Hospitals List */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4">
          {filtered.map(hospital => (
            <div 
              key={hospital._id || `${hospital.name}-${hospital.email}-${hospital.phone}`} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow border ${
                hospital.isActive 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-red-200 dark:border-red-800'
              } transition-all duration-200 hover:shadow-lg`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {hospital.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        hospital.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {hospital.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {hospital.address && (
                        <div className="flex items-center gap-1">
                          <FiMapPin />
                          <span>{hospital.address}</span>
                        </div>
                      )}
                      {hospital.phone && (
                        <div className="flex items-center gap-1">
                          <FiPhone />
                          <span>{hospital.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(hospital)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      title="View hospital details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleActive(hospital)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        hospital.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={hospital.isActive ? "Deactivate hospital" : "Activate hospital"}
                    >
                      {hospital.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                    </button>
                  </div>
                </div>
                
                {/* Additional Info */}
                {(hospital.email || hospital.openingHours || hospital.services) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      {hospital.email && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FiMail />
                          <span>{hospital.email}</span>
                        </div>
                      )}
                      {hospital.openingHours && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FiClock />
                          <span>{hospital.openingHours}</span>
                        </div>
                      )}
                    </div>
                    {hospital.services && hospital.services.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {hospital.services.slice(0, 3).map((service) => (
                            <span 
                              key={service}
                              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
                            >
                              {service}
                            </span>
                          ))}
                          {hospital.services.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs rounded">
                              +{hospital.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facility Details Dialog */}
      {showFacilityDialog && selectedFacility && (
        <FacilityDetailsDialog
          selected={selectedFacility}
          onClose={() => setShowFacilityDialog(false)}
          onUpdate={handleFacilityUpdate}
          onSave={handleFacilitySave}
          onResetPassword={handleResetPassword}
          onToggleActive={handleToggleActiveFacility}
          lastSavedPassword={lastSavedPassword}
          tempPassword={tempPassword}
          onCopyToClipboard={handleCopyToClipboard}
          getMissingKeys={getMissingKeys}
          hospitalMap={HOSPITAL_SERVICE_MAP}
          pharmacyMap={PHARMACY_SERVICE_MAP}
          ALL_SERVICE_OPTIONS={ALL_SERVICE_OPTIONS}
          onEdit={(facility) => {
            setSelectedFacility(facility);
            setShowFacilityDialog(false);
            navigate('/map', { state: { editFacility: facility } });
          }}
        />
      )}

      {/* Create Facility Popup */}
      {showCreatePopup && (
        <CreateFacilityPopup
          open={showCreatePopup}
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleCreateFacility}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.title}
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        confirmColor={confirmDialog.confirmColor}
      />
    </div>
  );
}
