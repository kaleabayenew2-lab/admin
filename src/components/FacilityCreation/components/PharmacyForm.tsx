import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import {
  MedicalServices,
  Email,
  LocationOn,
  Schedule,
  Business,
  Person,
  MyLocation,
  CheckCircle,
  Error,
  Badge
} from '@mui/icons-material';
import { PHARMACY_SERVICE_MAP, PHARMACY_TYPES } from '../constants/serviceConstants';

interface PharmacyFormProps {
  formData: any;
  validationErrors: string[];
  validationState: any;
  onInputChange: (field: string) => (event: any) => void;
  onEmailChange: (event: any) => void;
  onPhoneChange: (event: any) => void;
  onServiceToggle: (service: string) => void;
  onLocationDetect: () => void;
  isDetectingLocation: boolean;
  showPassword: boolean;
  onPasswordToggle: () => void;
  onEmergencyToggle: (checked: boolean) => void;
  renderAdditionalInfo: () => React.ReactNode;
}

export const PharmacyForm: React.FC<PharmacyFormProps> = ({
  formData,
  validationErrors,
  validationState,
  onInputChange,
  onEmailChange,
  onPhoneChange,
  onServiceToggle,
  onLocationDetect,
  isDetectingLocation,
  showPassword,
  onPasswordToggle,
  onEmergencyToggle,
  renderAdditionalInfo
}) => {
  const getCurrentServices = () => {
    const typeKey = formData.pharmacyType;
    return typeKey ? (PHARMACY_SERVICE_MAP[typeKey] || []) : [];
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>Create Pharmacy</Typography>
      <Paper sx={{ p: 3, mb: 2, height: '100%', overflow: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Pharmacy Name"
              value={formData.name}
              onChange={onInputChange('name')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {validationState.checkingName ? (
                      <div style={{ width: 20, height: 20 }}>
                        <div className="spinner" style={{ 
                          border: '2px solid #f3f3f3', 
                          borderTop: '2px solid #3f51b5', 
                          borderRadius: '50%', 
                          width: '16px', 
                          height: '16px', 
                          animation: 'spin 1s linear infinite' 
                        }}></div>
                      </div>
                    ) : (
                      <MedicalServices sx={{ color: validationState.nameExists ? 'error.main' : 'inherit' }} />
                    )}
                  </InputAdornment>
                ),
              }}
              error={validationErrors.includes('name') || validationState.nameExists}
              helperText={
                validationState.nameExists 
                  ? 'This pharmacy name is already registered' 
                  : validationErrors.includes('name') 
                    ? 'Pharmacy name is required' 
                    : 'Enter a unique pharmacy name'
              }
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={onEmailChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {validationState.checkingEmail ? (
                      <CircularProgress size={16} />
                    ) : validationState.emailExists ? (
                      <Error sx={{ color: 'error.main' }} />
                    ) : formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                      <CheckCircle sx={{ color: 'success.main' }} />
                    ) : (
                      <Email />
                    )}
                  </InputAdornment>
                ),
              }}
              error={validationErrors.includes('email') || validationState.emailExists}
              helperText={
                validationState.emailExists 
                  ? 'This email is already registered'
                  : validationErrors.includes('email') 
                    ? 'Please enter a valid email address' 
                    : 'Email is required'
              }
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={formData.phone}
              onChange={onPhoneChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '16px' }}>🇪🇹</span>
                    <Typography variant="body2">+251</Typography>
                    {validationState.checkingPhone ? (
                      <CircularProgress size={16} />
                    ) : validationState.phoneExists ? (
                      <Error sx={{ color: 'error.main' }} />
                    ) : formData.phone && formData.phone.length === 9 ? (
                      <CheckCircle sx={{ color: 'success.main' }} />
                    ) : null}
                  </InputAdornment>
                ),
              }}
              placeholder="9XXXXXXXX"
              error={validationErrors.includes('phone') || validationState.phoneExists}
              helperText={
                validationState.phoneExists
                  ? 'This phone number is already registered'
                  : validationErrors.includes('phone') 
                    ? 'Phone must be 9 digits starting with 9 or 7' 
                    : 'Optional: Enter 9-digit number starting with 9 or 7'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={onInputChange('address')}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
              }}
              error={validationErrors.includes('address')}
              helperText={validationErrors.includes('address') ? 'Address is required' : ''}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={validationErrors.includes('pharmacyType')}>
              <InputLabel>Pharmacy Type</InputLabel>
              <Select
                value={formData.pharmacyType}
                onChange={(e) => {
                  onInputChange('pharmacyType')(e);
                }}
                label="Pharmacy Type"
              >
                {PHARMACY_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              {validationErrors.includes('pharmacyType') && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  Pharmacy type is required
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={validationErrors.includes('openingHoursType')}>
              <InputLabel>Opening Hours</InputLabel>
              <Select
                value={formData.openingHoursType}
                onChange={onInputChange('openingHoursType')}
                label="Opening Hours"
                startAdornment={<InputAdornment position="start"><Schedule /></InputAdornment>}
              >
                <MenuItem value="24hours">24 Hours</MenuItem>
                <MenuItem value="custom">Custom Hours</MenuItem>
              </Select>
              {validationErrors.includes('openingHoursType') && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  Opening hours type is required
                </Typography>
              )}
            </FormControl>
          </Grid>

          {formData.openingHoursType === 'custom' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Custom Opening Hours"
                value={formData.customOpeningHours}
                onChange={onInputChange('customOpeningHours')}
                placeholder="e.g., 8:00 AM - 6:00 PM"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Schedule /></InputAdornment>,
                }}
                error={validationErrors.includes('customOpeningHours')}
                helperText={validationErrors.includes('customOpeningHours') ? 'Custom opening hours are required' : 'Enter time frame (e.g., 8:00 AM - 6:00 PM)'}
                required
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={validationErrors.includes('ownership')}>
              <InputLabel>Ownership</InputLabel>
              <Select
                value={formData.ownership}
                onChange={onInputChange('ownership')}
                label="Ownership"
                startAdornment={<InputAdornment position="start"><Business /></InputAdornment>}
              >
                <MenuItem value="Public">Public</MenuItem>
                <MenuItem value="Private">Private</MenuItem>
              </Select>
              {validationErrors.includes('ownership') && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  Ownership is required
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={onInputChange('username')}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
              }}
              error={validationErrors.includes('username')}
              helperText={validationErrors.includes('username') ? 'Username is required' : ''}
              required
            />
          </Grid>

          
          {/* Password, Emergency, Notes - Always Visible */}
          {renderAdditionalInfo()}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Location Coordinates</Typography>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.latitude}
                  onChange={onInputChange('latitude')}
                  placeholder="e.g., -1.2921"
                  error={validationErrors.includes('latitude')}
                  helperText={validationErrors.includes('latitude') ? 'Invalid latitude (-90 to 90)' : 'Enter latitude'}
                  required
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.longitude}
                  onChange={onInputChange('longitude')}
                  placeholder="e.g., 36.8219"
                  error={validationErrors.includes('longitude')}
                  helperText={validationErrors.includes('longitude') ? 'Invalid longitude (-180 to 180)' : 'Enter longitude'}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onLocationDetect}
                  disabled={isDetectingLocation}
                  sx={{ height: '56px' }}
                  title="Detect current location"
                >
                  {isDetectingLocation ? (
                    <CircularProgress size={20} />
                  ) : (
                    <MyLocation />
                  )}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {formData.pharmacyType && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Available Services for {formData.pharmacyType}
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {getCurrentServices().map((service) => (
                  <Chip
                    key={service}
                    label={service}
                    clickable
                    onClick={() => onServiceToggle(service)}
                    color={formData.services.includes(service) ? 'primary' : 'default'}
                    variant={formData.services.includes(service) ? 'filled' : 'outlined'}
                  />
                ))}
              </div>
              {validationErrors.includes('services') && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  Please select at least one service
                </Typography>
              )}
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
};
