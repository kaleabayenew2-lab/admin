import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

interface OTPDialogProps {
  open: boolean;
  email: string;
  otpCode: string;
  isVerifyingOTP: boolean;
  resendTimer: number;
  canResendOTP: boolean;
  onOTPChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVerifyOTP: () => void;
  onResendOTP: () => void;
  onClose: () => void;
}

export const OTPDialog: React.FC<OTPDialogProps> = ({
  open,
  email,
  otpCode,
  isVerifyingOTP,
  resendTimer,
  canResendOTP,
  onOTPChange,
  onVerifyOTP,
  onResendOTP,
  onClose
}) => {
  const getResendButtonText = () => {
    if (resendTimer > 0) {
      return `Resend (${resendTimer}s)`;
    }
    return 'Resend Code';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify Email Address</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          We've sent a 6-digit verification code to your email address. Please enter it below to verify your email.
        </Typography>
        
        <Box sx={{ 
          mt: 2, 
          mb: 3, 
          p: 2, 
          backgroundColor: 'grey.50', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Verification code sent to:
          </Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            wordBreak: 'break-all'
          }}>
            {email}
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          label="Verification Code"
          value={otpCode}
          onChange={onOTPChange}
          placeholder="Enter 6-digit code"
          inputProps={{
            maxLength: 6,
            style: { textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }
          }}
          sx={{ mt: 2, mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            onClick={onResendOTP}
            disabled={!canResendOTP}
            variant="text"
            size="small"
          >
            {getResendButtonText()}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', display: 'block' }}>
          Check your spam folder if you don't see the email within a few minutes.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={onVerifyOTP}
          variant="contained"
          disabled={otpCode.length !== 6 || isVerifyingOTP}
          startIcon={isVerifyingOTP ? <CircularProgress size={16} /> : null}
        >
          {isVerifyingOTP ? 'Verifying...' : 'Verify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
