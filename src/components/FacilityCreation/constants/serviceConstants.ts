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

export const HOSPITAL_TYPES = Object.keys(HOSPITAL_SERVICE_MAP);
export const PHARMACY_TYPES = Object.keys(PHARMACY_SERVICE_MAP);

export const API_BASE_URL = 'http://localhost:5000';

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 3,
  PHONE_LENGTH: 9,
  PHONE_PREFIXES: ['9', '7'],
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  MAX_OTP_ATTEMPTS: 3,
  OTP_LOCK_DURATION_MINUTES: 15,
  RESEND_TIMER_SECONDS: 60
} as const;

export const COORDINATE_BOUNDS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180
} as const;
