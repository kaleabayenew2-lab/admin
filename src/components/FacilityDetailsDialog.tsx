import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Box, 
  Chip, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { Facility } from '../utils/facilityUtils';

interface FacilityDetailsDialogProps {
  selected: Facility | null;
  onClose: () => void;
  onUpdate: (facility: Facility) => void;
  onSave: (facility: Facility) => void;
  onResetPassword: (facility: Facility) => void;
  onToggleActive: (facility: Facility) => void;
  lastSavedPassword: string | null;
  tempPassword: string | null;
  onCopyToClipboard: (text: string, label?: string) => Promise<void>;
  getMissingKeys: (facility: Facility) => string[];
  hospitalMap: Record<string, string[]>;
  pharmacyMap: Record<string, string[]>;
  ALL_SERVICE_OPTIONS: string[];
  onEdit: (facility: Facility) => void;
}

const FacilityDetailsDialog: React.FC<FacilityDetailsDialogProps> = ({
  selected,
  onClose,
  onUpdate,
  onSave,
  onResetPassword,
  onToggleActive,
  lastSavedPassword,
  tempPassword,
  onCopyToClipboard,
  getMissingKeys,
  hospitalMap,
  pharmacyMap,
  ALL_SERVICE_OPTIONS,
  onEdit
}) => {
  const formatCoordinates = (loc: any) => {
    if (!loc || !Array.isArray(loc.coordinates) || loc.coordinates.length < 2) return null;
    const lat = loc.coordinates[1];
    const lng = loc.coordinates[0];
    return { lat, lng, text: `${lat}, ${lng}` };
  };

  if (!selected) return null;

  return (
    <Dialog 
      open={!!selected} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth 
      PaperProps={{ sx: { bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ 
        color: 'text.primary',
        fontWeight: 'bold',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        Facility Details
      </DialogTitle>
      <DialogContent sx={{ color: 'text.primary', pt: 3 }}>
        {/* Password Banner */}
        {(lastSavedPassword || tempPassword) && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            border: 1, 
            borderColor: 'warning.main', 
            bgcolor: 'warning.light', 
            borderRadius: 1 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="bold" 
                  sx={{ 
                    color: 'warning.dark'
                  }}
                >
                  Temporary password
                </Typography>
                <Typography 
                  variant="body2" 
                  component="div" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    mt: 1, 
                    wordBreak: 'break-all', 
                    color: 'text.primary'
                  }}
                >
                  {lastSavedPassword || tempPassword}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1, 
                    display: 'block',
                    color: 'success.dark'
                  }}
                >
                  Saved password
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={async () => { await onCopyToClipboard(String(lastSavedPassword || tempPassword || ''), 'Temporary password'); }}
                  sx={{
                    color: 'warning.dark',
                    borderColor: 'warning.dark'
                  }}
                >
                  Copy
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => { /* Clear password logic here */ }}
                  sx={{
                    color: 'text.secondary',
                    borderColor: 'text.secondary'
                  }}
                >
                  Dismiss
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Edit Mode - Inline */}
        {selected._editing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>Edit Facility</Typography>
            
            {/* Facility ID Display */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 1, 
              border: 1, 
              borderColor: 'primary.200',
              mb: 2
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Facility ID
              </Typography>
              <Typography 
                variant="body1" 
                fontWeight="bold" 
                color="primary.main"
                sx={{ fontFamily: 'monospace' }}
              >
                {selected._id || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Box sx={{ md: { gridColumn: 'span 2' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Name</Typography>
                    <TextField
                      fullWidth
                      value={selected.name || ''}
                      onChange={(e) => onUpdate({ ...selected, name: e.target.value })}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Phone</Typography>
                    <TextField
                      fullWidth
                      value={selected.phone || ''}
                      onChange={(e) => {
                        // Only allow 9 digits starting with 9 or 7
                        const value = e.target.value;
                        const phoneRegex = /^[97]\d{0,8}$/;
                        if (value === '' || phoneRegex.test(value)) {
                          onUpdate({ ...selected, phone: value });
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '16px' }}>🇪🇹</span>
                            <Typography variant="body2">+251</Typography>
                          </InputAdornment>
                        ),
                      }}
                      placeholder="9XXXXXXXX"
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Email</Typography>
                    <TextField
                      fullWidth
                      type="email"
                      value={selected.email || ''}
                      onChange={(e) => onUpdate({ ...selected, email: e.target.value })}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Address</Typography>
                    <TextField
                      fullWidth
                      value={selected.address || ''}
                      onChange={(e) => onUpdate({ ...selected, address: e.target.value })}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Opening Hours</Typography>
                    <TextField
                      fullWidth
                      value={selected.openingHours || ''}
                      onChange={(e) => onUpdate({ ...selected, openingHours: e.target.value })}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Ownership</Typography>
                    <TextField
                      fullWidth
                      value={selected.ownership || ''}
                      onChange={(e) => onUpdate({ ...selected, ownership: e.target.value })}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Username</Typography>
                    <TextField
                      fullWidth
                      value={selected.username || ''}
                      onChange={(e) => onUpdate({ ...selected, username: e.target.value })}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Agent ID</Typography>
                    <TextField
                      fullWidth
                      value={(selected as any).agentId || ''}
                      onChange={(e) => onUpdate({ ...selected, agentId: e.target.value } as any)}
                      size="small"
                      helperText="Minimum 4 characters with letters and numbers (e.g., AG123)"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Location (lat,lng)</Typography>
                    <TextField
                      fullWidth
                      value={selected.location && Array.isArray(selected.location.coordinates) ? `${selected.location.coordinates[1]},${selected.location.coordinates[0]}` : ''}
                      onChange={(e) => onUpdate({ ...selected, location: e.target.value })}
                      size="small"
                      placeholder="e.g., -1.2921, 36.8219"
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => onSave(selected)}
                >
                  Save
                </Button>

                <Button 
                  variant="outlined"
                  onClick={() => onUpdate({ ...selected, _editing: false })}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          /* Read-only view - Inline */
          selected.isActive === false ? (
            <DeactivatedFacilityView 
              facility={selected}
              onCopyToClipboard={onCopyToClipboard}
              formatCoordinates={formatCoordinates}
              onActivate={() => onToggleActive(selected)}
            />
          ) : (
            <ReadOnlyFacilityView 
              facility={selected}
              onCopyToClipboard={onCopyToClipboard}
              formatCoordinates={formatCoordinates}
              getMissingKeys={getMissingKeys}
              onEdit={() => onUpdate({ ...selected, _editing: true })}
              onResetPassword={onResetPassword}
              onToggleActive={onToggleActive}
            />
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Separate Edit Form Component
const EditFacilityForm: React.FC<{
  facility: Facility;
  onUpdate: (facility: Facility) => void;
  hospitalMap: Record<string, string[]>;
  pharmacyMap: Record<string, string[]>;
  ALL_SERVICE_OPTIONS: string[];
}> = ({ facility, onUpdate, hospitalMap, pharmacyMap, ALL_SERVICE_OPTIONS }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
        Edit Facility
      </Typography>
      
      <TextField
        fullWidth
        label="Name"
        value={facility.name || ''}
        onChange={(e) => onUpdate({ ...facility, name: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        label="Phone"
        value={facility.phone || ''}
        onChange={(e) => onUpdate({ ...facility, phone: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        type="email"
        label="Email"
        value={facility.email || ''}
        onChange={(e) => onUpdate({ ...facility, email: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        label="Address"
        value={facility.address || ''}
        onChange={(e) => onUpdate({ ...facility, address: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        label="Opening Hours"
        value={facility.openingHours || ''}
        onChange={(e) => onUpdate({ ...facility, openingHours: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        label="Ownership"
        value={facility.ownership || ''}
        onChange={(e) => onUpdate({ ...facility, ownership: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        label="Username"
        value={facility.username || ''}
        onChange={(e) => onUpdate({ ...facility, username: e.target.value })}
        size="small"
      />
      
      <TextField
        fullWidth
        label="Location (lat,lng)"
        value={facility.location && Array.isArray(facility.location.coordinates) 
          ? `${facility.location.coordinates[1]},${facility.location.coordinates[0]}` 
          : ''}
        onChange={(e) => onUpdate({ ...facility, location: e.target.value })}
        size="small"
        placeholder="e.g., -1.2921, 36.8219"
      />
    </Box>
  );
};

// Separate Read-Only View Component
const ReadOnlyFacilityView: React.FC<{
  facility: Facility;
  onCopyToClipboard: (text: string, label?: string) => Promise<void>;
  formatCoordinates: (loc: any) => any;
  getMissingKeys: (facility: Facility) => string[];
  onEdit: (facility: Facility) => void;
  onResetPassword: (facility: Facility) => void;
  onToggleActive: (facility: Facility) => void;
}> = ({ 
  facility, 
  onCopyToClipboard, 
  formatCoordinates, 
  getMissingKeys, 
  onEdit, 
  onResetPassword, 
  onToggleActive 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">{facility.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{facility.type}</Typography>
              <Chip 
                label={facility.isActive ? 'Active' : 'Inactive'} 
                size="small" 
                color={facility.isActive ? 'success' : 'error'}
              />
              {facility.ownership && (
                <Typography variant="caption" color="text.secondary">• { facility.ownership }</Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Agent ID</Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
              {(facility as any).agentId || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>Contact</Typography>
            {facility.phone ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>{facility.phone}</Typography>
                <Button size="small" variant="outlined" onClick={() => onCopyToClipboard(String(facility.phone), 'Phone')}>
                  Copy
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Phone not provided</Typography>
            )}

            {facility.email ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>{facility.email}</Typography>
                <Button size="small" variant="outlined" onClick={() => onCopyToClipboard(String(facility.email), 'Email')}>
                  Copy
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Email not provided</Typography>
            )}

            {facility.address && (
              <Typography variant="body2" color="text.primary" sx={{ mt: 2 }}>{facility.address}</Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>Location</Typography>
            {facility.location ? (
              (() => {
                const c = formatCoordinates(facility.location);
                if (!c) return <Typography variant="body2" color="text.secondary">Coordinates not available</Typography>;
                const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                        {c.text}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => onCopyToClipboard(c.text, 'Coordinates')}>
                          Copy
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success"
                          href={mapsSearch} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          Open Map
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })()
            ) : (
              <Typography variant="body2" color="text.secondary">Location not set</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>Services</Typography>
          {facility.services && Array.isArray(facility.services) && facility.services.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {facility.services.map((s: any) => (
                <Chip key={s} label={s} size="small" variant="outlined" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No services listed</Typography>
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.primary">
              <strong>Username:</strong> {facility.username || '(none)'} 
              {facility.username && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ ml: 1 }} 
                  onClick={() => onCopyToClipboard(facility.username, 'Username')}
                >
                  Copy
                </Button>
              )}
            </Typography>
            <Typography variant="body2" color="text.primary">
              <strong>Agent ID:</strong> {(facility as any).agentId || '(n/a)'}
              {(facility as any).agentId && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ ml: 1 }} 
                  onClick={() => onCopyToClipboard((facility as any).agentId, 'Agent ID')}
                >
                  Copy
                </Button>
              )}
            </Typography>
            <Typography variant="body2" color="text.primary">
              <strong>Type:</strong> {facility.hospitalType || facility.pharmacyType || '(n/a)'}
            </Typography>
            <Typography variant="body2" color="text.primary">
              <strong>Opening Hours:</strong> {facility.openingHours || '(n/a)'}
            </Typography>
            <Typography variant="body2" color="text.primary">
              <strong>Password set:</strong> {facility.passwordHash ? 'Yes' : 'No'}
            </Typography>
          </Box>

          {facility.notes && (
            <Typography variant="body2" color="text.primary" sx={{ mt: 2 }}>
              <strong>Notes:</strong> {facility.notes}
            </Typography>
          )}

          {getMissingKeys(facility).length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" color="warning.dark">
                Missing: {getMissingKeys(facility).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Actions Section at Bottom */}
      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          Actions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={() => onEdit(facility)}
            sx={{ flex: { xs: 1, sm: 'auto' }, minWidth: 100 }}
          >
            Edit
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => onResetPassword(facility)}
            sx={{ flex: { xs: 1, sm: 'auto' }, minWidth: 120 }}
          >
            Reset Password
          </Button>
          <Button 
            variant="contained" 
            color={facility.isActive ? 'error' : 'success'}
            onClick={() => onToggleActive(facility)}
            sx={{ flex: { xs: 1, sm: 'auto' }, minWidth: 100 }}
          >
            {facility.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Deactivated Facility View Component
const DeactivatedFacilityView: React.FC<{
  facility: Facility;
  onCopyToClipboard: (text: string, label?: string) => Promise<void>;
  formatCoordinates: (loc: any) => any;
  onActivate: () => void;
}> = ({ 
  facility, 
  onCopyToClipboard, 
  formatCoordinates, 
  onActivate 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Deactivated Status Banner */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'error.light', 
        borderRadius: 2, 
        border: 2, 
        borderColor: 'error.main',
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error.main" fontWeight="bold" sx={{ mb: 1 }}>
          Facility Deactivated
        </Typography>
        <Typography variant="body1" color="error.dark">
          This facility is currently inactive and not accessible to users.
        </Typography>
      </Box>

      {/* Basic Facility Info */}
      <Box>
        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          {facility.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{facility.type}</Typography>
          <Chip 
            label="Inactive" 
            size="small" 
            color="error"
          />
          {facility.ownership && (
            <Typography variant="caption" color="text.secondary">• { facility.ownership }</Typography>
          )}
        </Box>
      </Box>

      {/* Basic Information */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
            Basic Information
          </Typography>
          {facility.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>{facility.phone}</Typography>
              <Button size="small" variant="outlined" onClick={() => onCopyToClipboard(String(facility.phone), 'Phone')}>
                Copy
              </Button>
            </Box>
          )}
          {facility.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>{facility.email}</Typography>
              <Button size="small" variant="outlined" onClick={() => onCopyToClipboard(String(facility.email), 'Email')}>
                Copy
              </Button>
            </Box>
          )}
          {facility.address && (
            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
              {facility.address}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
            Location
          </Typography>
          {facility.location ? (
            (() => {
              const c = formatCoordinates(facility.location);
              if (!c) return <Typography variant="body2" color="text.secondary">Coordinates not available</Typography>;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                      {c.text}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => onCopyToClipboard(c.text, 'Coordinates')}>
                        Copy
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        Open Map
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })()
          ) : (
            <Typography variant="body2" color="text.secondary">Location not set</Typography>
          )}
        </Box>
      </Box>

      {/* Agent ID */}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
          Agent ID
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontFamily: 'monospace' }}>
          {(facility as any).agentId || 'N/A'}
        </Typography>
        {(facility as any).agentId && (
          <Button 
            size="small" 
            variant="outlined" 
            sx={{ mt: 1 }} 
            onClick={() => onCopyToClipboard((facility as any).agentId, 'Agent ID')}
          >
            Copy Agent ID
          </Button>
        )}
      </Box>

      {/* Activate Button Section */}
      <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          Reactivate Facility
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click the button below to reactivate this facility and make it accessible to users again.
        </Typography>
        <Button 
          variant="contained" 
          color="success"
          size="large"
          onClick={onActivate}
          sx={{ minWidth: 150 }}
        >
          Activate Facility
        </Button>
      </Box>
    </Box>
  );
};

export default FacilityDetailsDialog;