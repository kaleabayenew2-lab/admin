import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useConfirm } from '../contexts/ConfirmContext';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateFacilityPopup from '../components/CreateFacilityPopup';
import DashboardStats from '../components/DashboardStats';
import DashboardFilters from '../components/DashboardFilters';
import FacilityTable from '../components/FacilityTable';
import FacilityDetailsDialog from '../components/FacilityDetailsDialog';
import { useFacilities } from '../hooks/useFacilities';
import { Facility, isComplete, copyToClipboard, getMissingKeys, generateTempPassword, HOSPITAL_SERVICE_MAP, PHARMACY_SERVICE_MAP, ALL_SERVICE_OPTIONS } from '../utils/facilityUtils';

export default function Dashboard() {
  const {
    facilities,
    filteredFacilities,
    loading,
    error,
    searchQuery,
    filter,
    completenessFilter,
    loadFacilities,
    createFacility,
    updateFacility,
    deleteFacility,
    resetFacilityPassword,
    toggleFacilityActive,
    setSearchQuery,
    setFilter,
    setCompletenessFilter,
  } = useFacilities();

  const [selected, setSelected] = useState<Facility | null>(null);
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [lastSavedPassword, setLastSavedPassword] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showTempModal, setShowTempModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showManualResetModal, setShowManualResetModal] = useState<boolean>(false);
  const [validationMissing, setValidationMissing] = useState<string[]>([]);
  const [servicesDone, setServicesDone] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [showResetControls, setShowResetControls] = useState<boolean>(false);
  const [showManualReset, setShowManualReset] = useState<boolean>(false);
  const [manualPwd, setManualPwd] = useState<string>('');
  
  // Password reset form states
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; message: string; color: string }>({ score: 0, message: '', color: '' });
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState<boolean | null>(null);
  
  // Email reset attempt tracking
  const [emailResetAttempts, setEmailResetAttempts] = useState<number>(0);
  const [lastEmailResetAttempt, setLastEmailResetAttempt] = useState<number>(0);
  const [emailResetLocked, setEmailResetLocked] = useState<boolean>(false);
  const [emailResetCooldown, setEmailResetCooldown] = useState<number>(0);
  
  const confirm = useConfirm();

  const handleCreateFacility = async (facility: any) => {
    const result = await createFacility(facility);
    if (result.success) {
      setShowCreatePopup(false);
      // Select the newly created facility to verify it has an ID
      if (result.facility && result.facility._id) {
        setSelected(result.facility);
      }
      
      // Show success indicator in the center of the page
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { 
            type: 'success', 
            message: '✅ Facility created successfully!',
            duration: 3000
          } 
        }));
      } catch(e){}
    }
  };

  const handleUpdateFacility = async (facility: Facility) => {
    // For inline editing, just update the selected state
    // The actual API call will happen when user clicks "Save"
    setSelected(facility as any);
  };

  const handleSaveFacility = async (facility: Facility) => {
    // Use _id field from Facility type
    const facilityId = facility._id;
    if (!facilityId) {
      console.error('Facility ID is missing:', facility);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Facility ID is missing' } })); } catch(e){}
      return;
    }
    
    // Format phone number before saving (add +251 prefix if not present)
    let formattedPhone = facility.phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+251')) {
      formattedPhone = `+251${formattedPhone}`;
    }
    
    const facilityToUpdate = {
      ...facility,
      phone: formattedPhone
    };
    
    console.log('Saving facility ID:', facilityId);
    const result = await updateFacility(facilityId, facilityToUpdate);
    if (result.success) {
      setSelected({ ...facilityToUpdate, _editing: false } as any);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Facility updated successfully' } })); } catch(e){}
    }
  };

  const handleResetPassword = async (facility: Facility) => {
    // Show the reset options modal instead of directly resetting
    setSelected(facility);
    setShowResetModal(true);
  };

  const checkEmailResetAttempts = (): { allowed: boolean; message: string; remainingAttempts?: number; cooldownTime?: number } => {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    // Check if currently in cooldown
    if (emailResetLocked && now - lastEmailResetAttempt < fifteenMinutes) {
      const remainingCooldown = Math.ceil((fifteenMinutes - (now - lastEmailResetAttempt)) / 60000);
      return {
        allowed: false,
        message: `Email reset is locked. Please wait ${remainingCooldown} minutes.`,
        cooldownTime: remainingCooldown
      };
    }
    
    // Reset cooldown if 15 minutes have passed
    if (emailResetLocked && now - lastEmailResetAttempt >= fifteenMinutes) {
      setEmailResetLocked(false);
      setEmailResetAttempts(0);
      setEmailResetCooldown(0);
    }
    
    // Check if attempts exceeded
    if (emailResetAttempts >= 3) {
      setEmailResetLocked(true);
      setLastEmailResetAttempt(now);
      setEmailResetCooldown(15);
      return {
        allowed: false,
        message: 'Maximum attempts reached. Please wait 15 minutes before trying again.',
        cooldownTime: 15
      };
    }
    
    return {
      allowed: true,
      message: '',
      remainingAttempts: 3 - emailResetAttempts
    };
  };

  const handleResetWithEmail = async (facility: Facility) => {
    if (!facility) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'No facility selected' } 
        }));
      } catch(e) {}
      return;
    }

    // Check if facility has email
    if (!facility.email) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'Facility email is required for password reset' } 
        }));
      } catch(e) {}
      return;
    }

    // Check attempt limits
    const attemptCheck = checkEmailResetAttempts();
    if (!attemptCheck.allowed) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: attemptCheck.message } 
        }));
      } catch(e) {}
      return;
    }

    try {
      // Increment attempt counter
      const newAttemptCount = emailResetAttempts + 1;
      setEmailResetAttempts(newAttemptCount);
      setLastEmailResetAttempt(Date.now());
      
      console.log(`Email reset attempt ${newAttemptCount}/3 for facility ${facility.name}`);
      
      // Show loading state
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'info', message: `Attempt ${newAttemptCount}/3: Generating secure password...` } 
        }));
      } catch(e) {}

      // Generate strong password using user info
      const strongPassword = generateStrongPassword(facility);
      console.log('Generated strong password:', strongPassword);
      
      // Reset password with generated password
      const facilityId = (facility as any).id || facility._id;
      if (!facilityId) {
        console.error('Facility ID is missing:', facility);
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'error', message: 'Facility ID is missing' } 
          }));
        } catch(e) {}
        return;
      }
      
      console.log('Using facility ID for email reset:', facilityId);
      
      // Show updating password state
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'info', message: 'Updating facility password...' } 
        }));
      } catch(e) {}
      
      const result = await resetFacilityPassword(facilityId, strongPassword);
      if (result.success) {
        console.log('Password reset successful, sending email...');
        
        // Show sending email state
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'info', message: 'Sending password via email...' } 
          }));
        } catch(e) {}

        // Send email with new password
        const emailResult = await sendPasswordEmail(facility, strongPassword);
        
        if (emailResult) {
          // Reset attempts on successful email reset
          setEmailResetAttempts(0);
          setEmailResetLocked(false);
          setLastEmailResetAttempt(0);
          setEmailResetCooldown(0);
          
          // Show success message (without displaying password)
          try {
            window.dispatchEvent(new CustomEvent('admin:toast', { 
              detail: { 
                type: 'success', 
                message: `✅ Password reset and sent to ${facility.email}` 
              } 
            }));
          } catch(e) {}
        } else {
          // Password was reset but email failed - don't reset attempts
          try {
            window.dispatchEvent(new CustomEvent('admin:toast', { 
              detail: { 
                type: 'warning', 
                message: `Password reset successful but email failed. Please check email configuration. (${3 - newAttemptCount} attempts remaining)` 
              } 
            }));
          } catch(e) {}
        }
      } else {
        // Password reset failed - don't reset attempts
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'error', message: `${result.error || 'Failed to reset password'} (${3 - newAttemptCount} attempts remaining)` } 
          }));
        } catch(e) {}
      }
    } catch (error) {
      console.error('Reset with email error:', error);
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: `Failed to reset and send password (${3 - emailResetAttempts} attempts remaining)` } 
        }));
      } catch(e) {}
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      return { score: 0, message: '', color: '' };
    }
    
    let score = 0;
    let message = '';
    let color = '';
    
    // Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Determine strength message and color
    if (score <= 2) {
      message = 'Weak';
      color = 'error';
    } else if (score <= 4) {
      message = 'Medium';
      color = 'warning';
    } else {
      message = 'Strong';
      color = 'success';
    }
    
    return { score, message, color };
  };

  const verifyCurrentPassword = async (password: string) => {
    if (!selected || !password) {
      setIsCurrentPasswordValid(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/facilities/${selected._id}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const result = await response.json();
      setIsCurrentPasswordValid(result.valid);
    } catch (error) {
      console.error('Error verifying current password:', error);
      setIsCurrentPasswordValid(false);
    }
  };

  const handleManualReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'New passwords do not match' } 
        }));
      } catch(e) {}
      return;
    }
    
    // Validate password length
    if (newPassword.length < 6 || newPassword.length > 8) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'Password must be 6-8 characters long' } 
        }));
      } catch(e) {}
      return;
    }
    
    // Validate password strength
    const strength = calculatePasswordStrength(newPassword);
    if (strength.score < 3) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'Password is too weak. Please include uppercase, lowercase, and numbers.' } 
        }));
      } catch(e) {}
      return;
    }
    
    // Verify current password if provided
    if (currentPassword && isCurrentPasswordValid === false) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'Current password is incorrect' } 
        }));
      } catch(e) {}
      return;
    }
    
    if (!selected) {
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'No facility selected' } 
        }));
      } catch(e) {}
      return;
    }
    
    try {
      const facilityId = selected._id;
      if (!facilityId) {
        console.error('Facility ID is missing:', selected);
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'error', message: 'Facility ID is missing' } 
          }));
        } catch(e) {}
        return;
      }
      
      const result = await resetFacilityPassword(facilityId, newPassword);
      if (result.success) {
        setShowManualResetModal(false);
        
        // Reset form states
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength({ score: 0, message: '', color: '' });
        setIsCurrentPasswordValid(null);
        setManualPwd('');
        
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'success', message: 'Password reset successfully' } 
          }));
        } catch(e) {}
      } else {
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'error', message: result.error || 'Failed to reset password' } 
          }));
        } catch(e) {}
      }
    } catch (error) {
      console.error('Manual reset error:', error);
      try {
        window.dispatchEvent(new CustomEvent('admin:toast', { 
          detail: { type: 'error', message: 'Failed to reset password' } 
        }));
      } catch(e) {}
    }
  };

  const generateStrongPassword = (facility: Facility): string => {
    console.log('🔐 Generating strong password for facility:', facility.name);
    
    // Extract letters from username
    const username = facility.username || facility.name || '';
    const usernameLetters = username.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
    
    // Extract numbers from phone
    const phone = facility.phone || '';
    const phoneNumbers = phone.replace(/[^0-9]/g, '').slice(-3);
    
    // Generate random characters to fill remaining length
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    
    // Calculate how many random characters we need
    let currentLength = usernameLetters.length + phoneNumbers.length;
    let targetLength = 6; // Minimum 6 characters
    
    // If we have enough from username and phone, aim for 8 characters
    if (currentLength >= 4) {
      targetLength = 8;
    }
    
    const remainingLength = targetLength - currentLength;
    
    for (let i = 0; i < remainingLength; i++) {
      randomPart += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    
    // Combine parts
    let password = usernameLetters + phoneNumbers + randomPart;
    
    // Ensure we have at least 6 characters
    if (password.length < 6) {
      const additionalChars = 6 - password.length;
      for (let i = 0; i < additionalChars; i++) {
        password += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
    }
    
    // Trim to 8 characters if longer
    if (password.length > 8) {
      password = password.slice(0, 8);
    }
    
    // Final fallback - generate completely random if something went wrong
    if (password.length < 6) {
      console.warn('Password generation failed, using fallback');
      password = '';
      for (let i = 0; i < 6; i++) {
        password += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
    }
    
    console.log(`🔐 Generated password: ${password} (from username: "${usernameLetters}", phone: "${phoneNumbers}", random: "${randomPart}")`);
    return password;
  };

  const sendPasswordEmail = async (facility: Facility, password: string): Promise<boolean> => {
    try {
      console.log(`📧 Sending password email to ${facility.email} for facility ${facility.name}`);
      
      const response = await fetch('/api/facilities/send-password-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: facility.email,
          facilityName: facility.name,
          password: password,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ Password email sent successfully to ${facility.email}`);
        return true;
      } else {
        console.error('❌ Failed to send password email:', result.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending password email:', error);
      return false;
    }
  };

  const handleToggleActive = async (facility: Facility) => {
    const action = facility.isActive ? 'Deactivate' : 'Activate';
    const ok = await confirm({ 
      title: `${action} facility`, 
      message: `${action} this facility? This will ${action.toLowerCase()} the facility and make it ${facility.isActive ? 'inaccessible' : 'accessible'} to users.`, 
      confirmText: action, 
      cancelText: 'Cancel', 
      danger: (action === 'Deactivate') 
    });
    if (ok) {
      try {
        // Use _id field from Facility type
        const facilityId = facility._id;
        if (!facilityId) {
          console.error('Facility ID is missing:', facility);
          try {
            window.dispatchEvent(new CustomEvent('admin:toast', { 
              detail: { type: 'error', message: 'Facility ID is missing' } 
            }));
          } catch(e) {}
          return;
        }
        
        console.log('Toggling active status for facility ID:', facilityId);
        const result = await toggleFacilityActive(facilityId, facility.isActive || false);
        if (result.success) {
          // Show success toast
          try {
            window.dispatchEvent(new CustomEvent('admin:toast', { 
              detail: { type: 'success', message: `Facility ${action}d successfully` } 
            }));
          } catch(e) {}
          // Update the selected facility to reflect the change
          setSelected({ ...facility, isActive: !facility.isActive } as any);
        } else {
          // Show error toast
          try {
            window.dispatchEvent(new CustomEvent('admin:toast', { 
              detail: { type: 'error', message: `Failed to ${action.toLowerCase()} facility` } 
            }));
          } catch(e) {}
        }
      } catch (error) {
        console.error('Toggle active error:', error);
        try {
          window.dispatchEvent(new CustomEvent('admin:toast', { 
            detail: { type: 'error', message: `Failed to ${action.toLowerCase()} facility` } 
          }));
        } catch(e) {}
      }
    }
  };

  const handleEdit = (facility: Facility) => {
    setSelected({ ...facility, _editing: true } as any);
  };

  return (
    <>
      <DashboardFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        completenessFilter={completenessFilter}
        setCompletenessFilter={setCompletenessFilter}
        loading={loading}
        onReload={loadFacilities}
      />

      <DashboardStats facilities={facilities} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Facilities</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowCreatePopup(true)}
        >
          Create Facility
        </Button>
      </Box>

      <FacilityTable
        facilities={filteredFacilities}
        loading={loading}
        error={error}
        onRowClick={setSelected}
        onToggleActive={toggleFacilityActive}
        isComplete={isComplete}
      />

      <FacilityDetailsDialog
        selected={selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdateFacility}
        onSave={handleSaveFacility}
        onResetPassword={handleResetPassword}
        onToggleActive={handleToggleActive}
        lastSavedPassword={lastSavedPassword}
        tempPassword={tempPassword}
        onCopyToClipboard={copyToClipboard}
        getMissingKeys={getMissingKeys}
        hospitalMap={HOSPITAL_SERVICE_MAP}
        pharmacyMap={PHARMACY_SERVICE_MAP}
        ALL_SERVICE_OPTIONS={ALL_SERVICE_OPTIONS}
        onEdit={handleEdit}
      />

      {showTempModal && ReactDOM.createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowTempModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 012 12m-7.5-3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Temporary Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share this password with the facility administrator</p>
            </div>
            
            <div className="mb-6">
              <div className="font-mono text-lg p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-gray-900 dark:text-white break-all">
                {tempPassword}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={async () => { 
                  await copyToClipboard(String(tempPassword || ''), 'Temporary password'); 
                  try {
                    window.dispatchEvent(new CustomEvent('admin:toast', { 
                      detail: { type: 'success', message: 'Password copied to clipboard!' } 
                    }));
                  } catch(e) {}
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Copy Password
              </button>
              <button
                onClick={() => { setShowTempModal(false); setTempPassword(null); }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showResetModal && ReactDOM.createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowResetModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reset Facility Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose how you want to reset the password</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setShowManualResetModal(true);
                }}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Reset with New Password
              </button>

              <button
                onClick={() => {
                  handleResetWithEmail(selected);
                  setShowResetModal(false);
                }}
                disabled={emailResetLocked}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  emailResetLocked 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Reset & Send via Email
                {emailResetAttempts > 0 && !emailResetLocked && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {3 - emailResetAttempts} left
                  </span>
                )}
              </button>
            </div>

            {/* Attempt Status */}
            {(emailResetAttempts > 0 || emailResetLocked) && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {emailResetLocked ? (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Email reset locked for {emailResetCooldown} minutes
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>
                        {emailResetAttempts} of 3 attempts used. {3 - emailResetAttempts} remaining.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showManualResetModal && ReactDOM.createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black opacity-50" 
            onClick={() => setShowManualResetModal(false)}
            style={{ pointerEvents: 'auto' }}
          />
          <div 
            className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200"
            style={{ pointerEvents: 'auto', zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set New Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new password for {selected?.name}</p>
            </div>

            <form onSubmit={handleManualReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password (Optional)
                </label>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setIsCurrentPasswordValid(null);
                      if (e.target.value) {
                        verifyCurrentPassword(e.target.value);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 40px 8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: 'black',
                      outline: 'none'
                    }}
                    placeholder="Enter current password if known"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showCurrentPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {isCurrentPasswordValid === false && (
                  <p className="text-red-500 text-xs mt-1">Current password is incorrect</p>
                )}
                {isCurrentPasswordValid === true && (
                  <p className="text-green-500 text-xs mt-1">Current password verified</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                    required
                    minLength={6}
                    maxLength={8}
                    style={{
                      width: '100%',
                      padding: '8px 40px 8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: 'black',
                      outline: 'none'
                    }}
                    placeholder="6-8 characters"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showNewPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordStrength.message && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === 'error' ? 'text-red-500' :
                        passwordStrength.color === 'warning' ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'error' ? 'bg-red-500' :
                          passwordStrength.color === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    required
                    minLength={6}
                    maxLength={8}
                    style={{
                      width: '100%',
                      padding: '8px 40px 8px 12px',
                      border: confirmPassword && newPassword !== confirmPassword ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: 'black',
                      outline: 'none'
                    }}
                    placeholder="Confirm new password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">Passwords match</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualResetModal(false);
                    // Reset all states
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordStrength({ score: 0, message: '', color: '' });
                    setIsCurrentPasswordValid(null);
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      
      <CreateFacilityPopup
        open={showCreatePopup}
        onClose={() => setShowCreatePopup(false)}
        onCreate={handleCreateFacility}
      />
    </>
  );
}