export interface CreateFacilityPopupProps {
  open: boolean;
  onClose: () => void;
  onCreate: (facility: any) => void;
  defaultTab?: 'hospital' | 'pharmacy';
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface FacilityFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  openingHoursType: string;
  customOpeningHours: string;
  ownership: string;
  username: string;
  password: string;
  latitude: string;
  longitude: string;
  type: 'hospital' | 'pharmacy';
  hospitalType: string;
  pharmacyType: string;
  services: string[];
  emergency: boolean;
  agentId: string;
  notes: string;
}

export interface ValidationState {
  nameExists: boolean;
  emailExists: boolean;
  phoneExists: boolean;
  checkingName: boolean;
  checkingEmail: boolean;
  checkingPhone: boolean;
}

export interface OTPState {
  showOTPDialog: boolean;
  otpCode: string;
  resendTimer: number;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
  otpAttempts: number;
  otpLockedUntil: Date | null;
  isOtpLocked: boolean;
}

export interface FormUIState {
  tabValue: number;
  showPassword: boolean;
  servicesDone: boolean;
  validationErrors: string[];
  isSubmitting: boolean;
  isDetectingLocation: boolean;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  developmentOTP?: string;
  locked?: boolean;
}

export interface UniquenessCheckResponse {
  exists: boolean;
  email?: string;
  phone?: string;
}
