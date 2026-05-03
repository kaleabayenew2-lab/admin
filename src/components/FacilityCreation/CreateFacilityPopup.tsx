import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import { Person, Visibility, VisibilityOff, Close, SaveAs } from '@mui/icons-material';

import { CreateFacilityPopupProps, TabPanelProps } from './types/facilityTypes';
import { useFacilityForm } from './hooks/useFacilityForm';
import { useUniquenessValidation } from './hooks/useUniquenessValidation';
import { useOTPVerification } from './hooks/useOTPVerification';
import { HospitalForm } from './components/HospitalForm';
import { PharmacyForm } from './components/PharmacyForm';
import { OTPDialog } from './components/OTPDialog';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`facility-tabpanel-${index}`}
      aria-labelledby={`facility-tab-${index}`}
      style={{ height: 'calc(90vh - 200px)', overflow: 'auto' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
}

export default function CreateFacilityPopup({ open, onClose, onCreate, defaultTab = 'hospital' }: CreateFacilityPopupProps) {
  const initialTab = defaultTab === 'pharmacy' ? 1 : 0;
  const facilityForm = useFacilityForm(initialTab, defaultTab);
  const uniquenessValidation = useUniquenessValidation();
  const otpVerification = useOTPVerification();

  // Reset all states when dialog closes
  const handleClose = () => {
    facilityForm.resetForm();
    uniquenessValidation.resetValidation();
    otpVerification.resetOTP();
    onClose();
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    facilityForm.handleTabChange(newValue);
  };

  // Handle input changes with validation
  const handleInputChange = (field: string) => (event: any) => {
    // Special handling for hospital or pharmacy type - reset services when type changes
    if (field === 'hospitalType' || field === 'pharmacyType') {
      facilityForm.updateFormField('services', []);
    }
    
    // Call the hook's handleInputChange with the event
    const handler = facilityForm.handleInputChange(field);
    handler(event);
    
    // Check name uniqueness when name field changes
    if (field === 'name') {
      console.log('Name changed to:', event.target.value, 'Type:', facilityForm.formData.type);
      uniquenessValidation.checkNameUniqueness(event.target.value, facilityForm.formData.type);
    }
  };

  // Handle email change with validation
  const handleEmailChange = (event: any) => {
    facilityForm.handleEmailChange(event);
    
    // Check email uniqueness in real-time
    if (facilityForm.isValidEmail(event.target.value)) {
      uniquenessValidation.checkEmailUniqueness(event.target.value);
    } else {
      uniquenessValidation.updateValidationState({ emailExists: false });
    }
  };

  // Handle phone change with validation
  const handlePhoneChange = (event: any) => {
    facilityForm.handlePhoneChange(event);
    
    // Check phone uniqueness in real-time when 9 digits are entered
    if (event.target.value.length === 9) {
      uniquenessValidation.checkPhoneUniqueness(event.target.value);
    } else {
      uniquenessValidation.updateValidationState({ phoneExists: false });
    }
  };

  // Handle form submission
  const handleCreate = async () => {
    const errors = facilityForm.validateForm();
    if (errors.length > 0) {
      facilityForm.updateFormUIState({ validationErrors: errors });
      return;
    }
    
    // Start OTP verification process
    const result = await otpVerification.handleSendOTP(
      facilityForm.formData.email, 
      facilityForm.formData.name
    );
    
    if (!result.success) {
      return; // Error already handled in hook
    }
  };

  // Handle OTP verification success
  const handleOTPSuccess = async () => {
    try {
      facilityForm.updateFormUIState({ isSubmitting: true });
      const facilityObject = facilityForm.createFacilityObject();
      await onCreate(facilityObject);
      handleClose();
    } catch (error) {
      console.error('Failed to create facility:', error);
    } finally {
      facilityForm.updateFormUIState({ isSubmitting: false });
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    await otpVerification.handleVerifyOTP(facilityForm.formData.email, handleOTPSuccess);
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    await otpVerification.handleSendOTP(
      facilityForm.formData.email, 
      facilityForm.formData.name
    );
  };

  // Reusable section for password, emergency, and notes
  const renderAdditionalInfo = () => (
    <>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Password (Optional)"
          type={facilityForm.formUIState.showPassword ? 'text' : 'password'}
          value={facilityForm.formData.password}
          onChange={facilityForm.handleInputChange('password')}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={() => facilityForm.updateFormUIState({ showPassword: !facilityForm.formUIState.showPassword })}
                  sx={{ minWidth: 'auto', p: 0 }}
                >
                  {facilityForm.formUIState.showPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              </InputAdornment>
            )
          }}
          error={facilityForm.formUIState.validationErrors.includes('password')}
          helperText={
            facilityForm.formUIState.validationErrors.includes('password') 
              ? 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
              : 'Optional: Leave blank for auto-generated password'
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={facilityForm.formData.emergency}
              onChange={(e) => facilityForm.updateFormField('emergency', e.target.checked)}
              color="error"
            />
          }
          label="Emergency Facility"
          sx={{ mt: 1 }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Notes (Optional)"
          value={facilityForm.formData.notes}
          onChange={facilityForm.handleInputChange('notes')}
          multiline
          rows={3}
          placeholder="Any additional information about this facility..."
          helperText="Optional: Add any notes or special instructions"
        />
      </Grid>
    </>
  );

  // Check if form is valid
  const isFormValid = facilityForm.isFormValid() && 
    !uniquenessValidation.validationState.nameExists &&
    !uniquenessValidation.validationState.emailExists &&
    !uniquenessValidation.validationState.phoneExists;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>Create New Facility</DialogTitle>
        <DialogContent sx={{ 
          height: 'calc(90vh - 140px)', 
          overflow: 'hidden',
          p: 0
        }}>
          <Tabs 
            value={facilityForm.formUIState.tabValue} 
            onChange={handleTabChange} 
            aria-label="Facility type tabs"
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              minHeight: 'auto'
            }}
          >
            <Tab label="Hospital" />
            <Tab label="Pharmacy" />
          </Tabs>

          <TabPanel value={facilityForm.formUIState.tabValue} index={0}>
            <HospitalForm
              formData={facilityForm.formData}
              validationErrors={facilityForm.formUIState.validationErrors}
              validationState={uniquenessValidation.validationState}
              onInputChange={handleInputChange}
              onEmailChange={handleEmailChange}
              onPhoneChange={handlePhoneChange}
              onServiceToggle={facilityForm.handleServiceToggle}
              onLocationDetect={facilityForm.handleLocationDetect}
              isDetectingLocation={facilityForm.formUIState.isDetectingLocation}
              showPassword={facilityForm.formUIState.showPassword}
              onPasswordToggle={() => facilityForm.updateFormUIState({ showPassword: !facilityForm.formUIState.showPassword })}
              onEmergencyToggle={(checked) => facilityForm.updateFormField('emergency', checked)}
              renderAdditionalInfo={renderAdditionalInfo}
            />
          </TabPanel>

          <TabPanel value={facilityForm.formUIState.tabValue} index={1}>
            <PharmacyForm
              formData={facilityForm.formData}
              validationErrors={facilityForm.formUIState.validationErrors}
              validationState={uniquenessValidation.validationState}
              onInputChange={handleInputChange}
              onEmailChange={handleEmailChange}
              onPhoneChange={handlePhoneChange}
              onServiceToggle={facilityForm.handleServiceToggle}
              onLocationDetect={facilityForm.handleLocationDetect}
              isDetectingLocation={facilityForm.formUIState.isDetectingLocation}
              showPassword={facilityForm.formUIState.showPassword}
              onPasswordToggle={() => facilityForm.updateFormUIState({ showPassword: !facilityForm.formUIState.showPassword })}
              onEmergencyToggle={(checked) => facilityForm.updateFormField('emergency', checked)}
              renderAdditionalInfo={renderAdditionalInfo}
            />
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            startIcon={<Close />}
            disabled={facilityForm.formUIState.isSubmitting || otpVerification.otpState.isVerifyingOTP}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            startIcon={facilityForm.formUIState.isSubmitting || otpVerification.otpState.isSendingOTP ? <CircularProgress size={16} /> : <SaveAs />}
            disabled={!isFormValid || facilityForm.formUIState.isSubmitting || otpVerification.otpState.isSendingOTP || otpVerification.otpState.isVerifyingOTP}
          >
            {facilityForm.formUIState.isSubmitting || otpVerification.otpState.isSendingOTP ? 'Creating...' : 'Create Facility'}
          </Button>
        </DialogActions>
      </Dialog>

      <OTPDialog
        open={otpVerification.otpState.showOTPDialog}
        email={facilityForm.formData.email}
        otpCode={otpVerification.otpState.otpCode}
        isVerifyingOTP={otpVerification.otpState.isVerifyingOTP}
        resendTimer={otpVerification.otpState.resendTimer}
        canResendOTP={otpVerification.canResendOTP()}
        onOTPChange={otpVerification.handleOTPChange}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
        onClose={() => otpVerification.updateOTPState({ showOTPDialog: false })}
      />
    </>
  );
}
