import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

interface DashboardStatsProps {
  facilities: Array<{
    type: string;
  }>;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ facilities }) => {
  const hospitalCount = facilities.filter(f => f.type === 'hospital').length;
  const pharmacyCount = facilities.filter(f => f.type === 'pharmacy').length;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">Active Facilities</Typography>
            <Typography variant="h4">{facilities.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">Hospitals</Typography>
            <Typography variant="h4">{hospitalCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">Pharmacies</Typography>
            <Typography variant="h4">{pharmacyCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardStats;
