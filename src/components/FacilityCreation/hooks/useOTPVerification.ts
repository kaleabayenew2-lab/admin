import { useState, useCallback } from 'react';
import { OTPState, OTPResponse } from '../types/facilityTypes';
import { API_BASE_URL, VALIDATION_RULES } from '../constants/serviceConstants';

const initialOTPState: OTPState = {
  showOTPDialog: false,
  otpCode: '',
  resendTimer: 0,
  isSendingOTP: false,
  isVerifyingOTP: false,
  otpAttempts: 0,
  otpLockedUntil: null,
  isOtpLocked: false
};

export const useOTPVerification = () => {
  const [otpState, setOtpState] = useState<OTPState>(initialOTPState);

  const resetOTP = useCallback(() => {
    setOtpState(initialOTPState);
  }, []);

  const updateOTPState = useCallback((updates: Partial<OTPState>) => {
    setOtpState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const handleOTPChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, VALIDATION_RULES.OTP_LENGTH);
    updateOTPState({ otpCode: value });
  }, [updateOTPState]);

  const startResendTimer = useCallback(() => {
    updateOTPState({ resendTimer: VALIDATION_RULES.RESEND_TIMER_SECONDS });
    
    const timer = setInterval(() => {
      setOtpState(prev => {
        if (prev.resendTimer <= 1) {
          clearInterval(timer);
          return { ...prev, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
  }, [updateOTPState]);

  const handleSendOTP = useCallback(async (email: string, facilityName: string) => {
    updateOTPState({ isSendingOTP: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          method: 'email',
          facilityName: facilityName || 'Facility'
        })
      });
      
      const result: OTPResponse = await response.json();
      
      if (result.success) {
        updateOTPState({ showOTPDialog: true });
        startResendTimer();
        
        showToast(result.message, 'success');
        
        // For development, show the OTP in console
        if (result.developmentOTP) {
          console.log('Development OTP:', result.developmentOTP);
        }
        
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to send OTP. Please try again.', 'error');
      return { success: false, error: error.message };
    } finally {
      updateOTPState({ isSendingOTP: false });
    }
  }, [updateOTPState, startResendTimer]);

  const handleVerifyOTP = useCallback(async (email: string, onSuccess: () => void) => {
    // Check if OTP is locked due to too many attempts
    if (otpState.isOtpLocked && otpState.otpLockedUntil) {
      const now = new Date();
      if (now < otpState.otpLockedUntil) {
        const remainingTime = Math.ceil((otpState.otpLockedUntil.getTime() - now.getTime()) / (1000 * 60));
        showToast(`Too many failed attempts. Please try again in ${remainingTime} minutes.`, 'error');
        return { success: false, error: 'OTP locked' };
      } else {
        // Lock period expired, reset attempts
        updateOTPState({ 
          otpAttempts: 0, 
          isOtpLocked: false, 
          otpLockedUntil: null 
        });
      }
    }

    if (otpState.otpCode.length !== VALIDATION_RULES.OTP_LENGTH) {
      showToast('Please enter 6-digit OTP code', 'error');
      return { success: false, error: 'Invalid OTP length' };
    }

    updateOTPState({ isVerifyingOTP: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          code: otpState.otpCode,
          method: 'email'
        })
      });
      
      const result: OTPResponse = await response.json();
      
      if (result.success) {
        updateOTPState({ 
          showOTPDialog: false, 
          otpCode: '', 
          otpAttempts: 0, 
          isOtpLocked: false, 
          otpLockedUntil: null 
        });
        
        showToast(result.message, 'success');
        
        // Call success callback
        onSuccess();
        
        return { success: true };
      } else {
        // Handle server-side lockout
        if (result.locked) {
          const lockUntil = new Date(Date.now() + VALIDATION_RULES.OTP_LOCK_DURATION_MINUTES * 60 * 1000);
          updateOTPState({ 
            otpLockedUntil: lockUntil, 
            isOtpLocked: true,
            showOTPDialog: false
          });
          
          showToast(result.message || 'Too many failed attempts. Please try again later.', 'error');
          return { success: false, locked: true, error: result.message };
        }
        
        // Increment attempt counter on failed OTP
        const newAttempts = otpState.otpAttempts + 1;
        updateOTPState({ otpAttempts: newAttempts });
        
        showToast(result.message || 'Invalid OTP. Please try again.', 'error');
        
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      // Error is already handled above, but we need to ensure the finally block runs
      if (otpState.otpAttempts < VALIDATION_RULES.MAX_OTP_ATTEMPTS) {
        showToast(error.message || 'Invalid OTP. Please try again.', 'error');
      }
      return { success: false, error: error.message };
    } finally {
      updateOTPState({ isVerifyingOTP: false });
    }
  }, [otpState, updateOTPState]);

  const canResendOTP = useCallback(() => {
    return otpState.resendTimer === 0 && !otpState.isSendingOTP;
  }, [otpState.resendTimer, otpState.isSendingOTP]);

  const getResendButtonText = useCallback(() => {
    if (otpState.resendTimer > 0) {
      return `Resend (${otpState.resendTimer}s)`;
    }
    return 'Resend Code';
  }, [otpState.resendTimer]);

  return {
    // State
    otpState,
    
    // Actions
    resetOTP,
    updateOTPState,
    handleOTPChange,
    handleSendOTP,
    handleVerifyOTP,
    
    // Utilities
    canResendOTP,
    getResendButtonText,
    startResendTimer
  };
};

// Helper function for toast notifications
const showToast = (message: string, type: 'success' | 'error') => {
  try {
    window.dispatchEvent(new CustomEvent('admin:toast', { 
      detail: { type, message } 
    }));
  } catch(e) {}
};
