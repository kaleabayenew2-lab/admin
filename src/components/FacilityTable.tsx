import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip, Button, Box } from '@mui/material';

type Facility = {
  _id: string;
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
  _editing?: boolean;
};

interface FacilityTableProps {
  facilities: Facility[];
  loading: boolean;
  error: string;
  onRowClick: (facility: Facility) => void;
  isComplete: (facility: Facility) => boolean;
}

const FacilityTable: React.FC<FacilityTableProps> = ({
  facilities,
  loading,
  error,
  onRowClick,
  isComplete
}) => {
  const formatCoordinates = (loc: any) => {
    if (!loc || !Array.isArray(loc.coordinates) || loc.coordinates.length < 2) return null;
    const lat = loc.coordinates[1];
    const lng = loc.coordinates[0];
    return { lat, lng, text: `${lat}, ${lng}` };
  };

  if (loading) {
    return <Typography>Loading facilities...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }

  if (facilities.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No facilities found for selected filter.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Phone</strong></TableCell>
            <TableCell><strong>Location</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {facilities.map(f => (
            <TableRow 
              key={f._id || f.name || Math.random()} 
              sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }, cursor: 'pointer' }}
              onClick={() => onRowClick(f)}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isComplete(f) ? <Chip label="✓" color="success" size="small" /> : <Chip label="⚠" color="warning" size="small" />}
                  <Typography variant="body2" fontWeight={f.isActive === false ? 'normal' : 'medium'}>
                    {f.name}
                  </Typography>
                  {f.isActive === false && <Chip label="Inactive" color="error" size="small" />}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={f.type} 
                  color={f.type === 'hospital' ? 'primary' : 'secondary'} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{f.email || '—'}</TableCell>
              <TableCell>{f.phone || '—'}</TableCell>
              <TableCell>
                {f.location && f.location.coordinates && f.location.coordinates.length >= 2 ? (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {f.location.coordinates[1].toFixed(4)}, {f.location.coordinates[0].toFixed(4)}
                  </Typography>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color={f.ownership === 'public' ? 'primary.main' : 'text.secondary'}>
                  {f.ownership || 'private'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onRowClick(f); }}
                  >
                    Details
                  </Button>
                  <Button 
                    variant={f.isActive ? "outlined" : "contained"} 
                    color={f.isActive ? "error" : "success"}
                    size="small"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onToggleActive(f); 
                    }}
                  >
                    {f.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FacilityTable;
