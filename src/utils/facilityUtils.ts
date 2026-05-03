// Facility utility functions extracted from Dashboard.tsx

export type Facility = {
  _id?: string;
  id?: string;
  name: string;
  type: 'hospital' | 'pharmacy' | string;
  username?: string;
  address?: string;
  phone?: string;
  email?: string;
  services?: string[] | string;
  openingHours?: string;
  ownership?: string;
  location?: any;
  hospitalType?: string;
  pharmacyType?: string;
  isActive?: boolean;
  passwordHash?: string;
  altPhone?: string[];
  notes?: string;
  emergency?: boolean;
  _editing?: boolean;
};

// Service catalog maps
export const HOSPITAL_SERVICE_MAP: Record<string, string[]> = {
  'General Hospitals': ['Emergency', 'Surgery', 'Radiology', 'Pediatrics', 'Maternity', 'Cardiology', 'Laboratory', 'Outpatient'],
  'Specialized Hospitals': ['Specialized Care', 'Radiology', 'Laboratory', 'Rehabilitation'],
  'Internal / Medical Hospitals': ['Internal Medicine', 'Cardiology', 'Endocrinology', 'Laboratory'],
  'Surgical Hospitals': ['Surgery', 'Anesthesiology', 'Operative Care', 'Radiology'],
  'Maternal & Child Hospitals': ['Maternity', 'Pediatrics', 'Neonatal', 'Obstetrics'],
  'Teaching & Referral Hospitals': ['Emergency', 'Surgery', 'Radiology', 'Research', 'Laboratory', 'Teaching Clinics'],
  'Clinics & Primary Care Facilities': ['General Practice', 'Outpatient', 'Vaccination', 'Basic Diagnostics']
};

export const PHARMACY_SERVICE_MAP: Record<string, string[]> = {
  'Hospital Pharmacy': ['Inpatient Dispensing', 'Clinical Pharmacy Support', 'Sterile Preparations'],
  'Community (Retail) Pharmacy': ['Retail Dispensing', 'OTC Advice', 'Vaccination Services'],
  'Clinical Pharmacy': ['Medication Review', 'Therapeutic Drug Monitoring', 'Clinical Consults'],
  'Industrial Pharmacy': ['Manufacturing Support', 'Quality Control'],
  'Wholesale / Distribution Pharmacy': ['Bulk Distribution', 'Logistics'],
  'Compounding Pharmacy': ['Non-sterile Compounding', 'Sterile Compounding'],
  'Regulatory / Public Health Pharmacy': ['Policy Support', 'Surveillance', 'Public Vaccination']
};

export const ALL_SERVICE_OPTIONS = Array.from(new Set([
  ...Object.values(HOSPITAL_SERVICE_MAP).flat(),
  ...Object.values(PHARMACY_SERVICE_MAP).flat()
]));

// Validation functions
export const isComplete = (facility: Facility): boolean => {
  const required = ['name', 'type', 'address', 'phone', 'email', 'services', 'openingHours', 'ownership'];
  return required.every(field => facility[field as keyof Facility] && 
    (Array.isArray(facility[field as keyof Facility]) ? 
      (facility[field as keyof Facility] as any[]).length > 0 : 
      String(facility[field as keyof Facility]).trim().length > 0));
};

export const getMissingKeys = (facility: Facility): string[] => {
  const required = ['name', 'type', 'address', 'phone', 'email', 'services', 'openingHours', 'ownership'];
  return required.filter(field => {
    const value = facility[field as keyof Facility];
    return !value || (Array.isArray(value) ? value.length === 0 : String(value).trim().length === 0);
  });
};

// Coordinate utilities
export const formatCoordinates = (loc: any) => {
  if (!loc || !Array.isArray(loc.coordinates) || loc.coordinates.length < 2) return null;
  const lat = loc.coordinates[1];
  const lng = loc.coordinates[0];
  return { lat, lng, text: `${lat}, ${lng}` };
};

export const parseCoordinates = (coordString: string) => {
  const match = coordString.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    return { type: 'Point', coordinates: [parseFloat(match[2]), parseFloat(match[1])] };
  }
  return null;
};

// Facility filtering
export const filterFacilities = (
  facilities: Facility[], 
  searchQuery: string, 
  filter: string, 
  completenessFilter: string
): Facility[] => {
  return facilities.filter(f => {
    // Enhanced Search filter - includes email, username, facility type, ownership, emergency status
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = `${f.name || ''} ${f.address || ''} ${f.phone || ''} ${f.email || ''} ${f.username || ''} ${f.type || ''} ${f.ownership || ''} ${f.emergency ? 'emergency' : ''} ${f._id || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // Type filter
    if (filter !== 'all' && f.type !== filter) return false;

    // Completeness filter
    if (completenessFilter === 'complete' && !isComplete(f)) return false;
    if (completenessFilter === 'incomplete' && isComplete(f)) return false;

    return true;
  });
};

// Service utilities
export const getHospitalServices = (hospitalType: string): string[] => {
  return HOSPITAL_SERVICE_MAP[hospitalType] || [];
};

export const getPharmacyServices = (pharmacyType: string): string[] => {
  return PHARMACY_SERVICE_MAP[pharmacyType] || [];
};

export const normalizeServices = (services: string | string[]): string[] => {
  if (Array.isArray(services)) return services;
  return String(services || '').split(',').map(s => s.trim()).filter(Boolean);
};

// Password generation
export const generateTempPassword = (): string => {
  return Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string, label?: string): Promise<void> => {
  try {
    if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
      await (navigator as any).clipboard.writeText(text);
    }
    try { 
      window.dispatchEvent(new CustomEvent('admin:toast', { 
        detail: { type: 'info', message: `${label || 'Value'} copied to clipboard` } 
      })); 
    } catch(e){}
  } catch (err) {
    try { 
      window.dispatchEvent(new CustomEvent('admin:toast', { 
        detail: { type: 'error', message: `Failed to copy ${label || 'value'}` } 
      })); 
    } catch(e){}
  }
};
