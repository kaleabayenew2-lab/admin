import { useState, useCallback, useRef } from 'react';
import { ValidationState, UniquenessCheckResponse } from '../types/facilityTypes';
import { API_BASE_URL, VALIDATION_RULES } from '../constants/serviceConstants';

const initialValidationState: ValidationState = {
  nameExists: false,
  emailExists: false,
  phoneExists: false,
  checkingName: false,
  checkingEmail: false,
  checkingPhone: false
};

export const useUniquenessValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>(initialValidationState);
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const resetValidation = useCallback(() => {
    setValidationState(initialValidationState);
    // Clear all debounce timers
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};
  }, []);

  const updateValidationState = useCallback((updates: Partial<ValidationState>) => {
    setValidationState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const debouncedCheckNameUniqueness = useCallback(async (name: string, type: 'hospital' | 'pharmacy') => {
    if (!name || name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
      updateValidationState({ nameExists: false });
      return;
    }

    // Clear existing timer
    if (debounceTimers.current.name) {
      clearTimeout(debounceTimers.current.name);
    }

    // Set new timer for debounced API call
    debounceTimers.current.name = setTimeout(async () => {
      updateValidationState({ checkingName: true });
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/facilities/check-name?name=${encodeURIComponent(name.trim())}&type=${type}`);
        
        if (!response.ok) {
          console.warn('Name uniqueness API not available, assuming unique');
          updateValidationState({ nameExists: false });
          return;
        }
        
        const data: UniquenessCheckResponse = await response.json();
        updateValidationState({ nameExists: data.exists });
      } catch (error) {
        console.error('Error checking name uniqueness:', error);
        updateValidationState({ nameExists: false });
      } finally {
        updateValidationState({ checkingName: false });
      }
    }, 500); // 500ms debounce delay
  }, [updateValidationState]);

  const checkNameUniqueness = useCallback((name: string, type: 'hospital' | 'pharmacy') => {
    debouncedCheckNameUniqueness(name, type);
  }, [debouncedCheckNameUniqueness]);

  const debouncedCheckEmailUniqueness = useCallback(async (email: string) => {
    if (!email || !isValidEmail(email)) {
      updateValidationState({ emailExists: false });
      return;
    }

    // Clear existing timer
    if (debounceTimers.current.email) {
      clearTimeout(debounceTimers.current.email);
    }

    // Set new timer for debounced API call
    debounceTimers.current.email = setTimeout(async () => {
      updateValidationState({ checkingEmail: true });
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/facilities/check-email?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          console.warn('Email uniqueness API not available, assuming unique');
          updateValidationState({ emailExists: false });
          return;
        }
        
        const data: UniquenessCheckResponse = await response.json();
        updateValidationState({ emailExists: data.exists });
      } catch (error) {
        console.error('Error checking email uniqueness:', error);
        updateValidationState({ emailExists: false });
      } finally {
        updateValidationState({ checkingEmail: false });
      }
    }, 500); // 500ms debounce delay
  }, [updateValidationState]);

  const checkEmailUniqueness = useCallback((email: string) => {
    debouncedCheckEmailUniqueness(email);
  }, [debouncedCheckEmailUniqueness]);

  const debouncedCheckPhoneUniqueness = useCallback(async (phone: string) => {
    if (!phone || phone.length < VALIDATION_RULES.PHONE_LENGTH) {
      updateValidationState({ phoneExists: false });
      return;
    }

    // Clear existing timer
    if (debounceTimers.current.phone) {
      clearTimeout(debounceTimers.current.phone);
    }

    // Set new timer for debounced API call
    debounceTimers.current.phone = setTimeout(async () => {
      updateValidationState({ checkingPhone: true });
      
      try {
        const formattedPhone = phone.startsWith('+251') ? phone : `+251${phone}`;
        const response = await fetch(`${API_BASE_URL}/api/facilities/check-phone?phone=${encodeURIComponent(formattedPhone)}`);
        
        if (!response.ok) {
          console.warn('Phone uniqueness API not available, assuming unique');
          updateValidationState({ phoneExists: false });
          return;
        }
        
        const data: UniquenessCheckResponse = await response.json();
        updateValidationState({ phoneExists: data.exists });
      } catch (error) {
        console.error('Error checking phone uniqueness:', error);
        updateValidationState({ phoneExists: false });
      } finally {
        updateValidationState({ checkingPhone: false });
      }
    }, 500); // 500ms debounce delay
  }, [updateValidationState]);

  const checkPhoneUniqueness = useCallback((phone: string) => {
    debouncedCheckPhoneUniqueness(phone);
  }, [debouncedCheckPhoneUniqueness]);

  // Helper function for email validation
  const isValidEmail = (email: string): boolean => {
    if (!email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    // State
    validationState,
    
    // Actions
    resetValidation,
    updateValidationState,
    checkNameUniqueness,
    checkEmailUniqueness,
    checkPhoneUniqueness,
    
    // Utilities
    isValidEmail
  };
};
