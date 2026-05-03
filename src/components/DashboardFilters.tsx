import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  completenessFilter: string;
  setCompletenessFilter: (filter: string) => void;
  loading: boolean;
  onReload: () => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  completenessFilter,
  setCompletenessFilter,
  loading,
  onReload
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
        <Button variant="outlined" onClick={onReload} disabled={loading} startIcon={<RefreshIcon />}>
          {loading ? 'Loading...' : 'Reload'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>Type:</Typography>
        <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>All</Button>
        <Button variant={filter === 'hospital' ? 'contained' : 'outlined'} onClick={() => setFilter('hospital')}>Hospitals</Button>
        <Button variant={filter === 'pharmacy' ? 'contained' : 'outlined'} onClick={() => setFilter('pharmacy')}>Pharmacies</Button>

        <Typography variant="body1" sx={{ fontWeight: 'medium', ml: 2 }}>Completion:</Typography>
        <Button variant={completenessFilter === 'all' ? 'contained' : 'outlined'} onClick={() => setCompletenessFilter('all')}>All</Button>
        <Button variant={completenessFilter === 'complete' ? 'contained' : 'outlined'} color="success" onClick={() => setCompletenessFilter('complete')}>Complete</Button>
        <Button variant={completenessFilter === 'incomplete' ? 'contained' : 'outlined'} color="warning" onClick={() => setCompletenessFilter('incomplete')}>Incomplete</Button>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, email, username, type, ownership, emergency..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ ml: 'auto', minWidth: 350 }}
        />
      </Box>
    </>
  );
};

export default DashboardFilters;
