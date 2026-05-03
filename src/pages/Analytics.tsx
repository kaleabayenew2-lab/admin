import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  LocalHospital,
  LocalPharmacy,
  Assessment,
  Timeline,
  Download,
  Refresh,
  FilterList,
  Schedule,
  Speed,
  Analytics as AnalyticsIcon,
  MonitorHeart,
  BookOnline,
  Payment
} from '@mui/icons-material';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    totalPharmacies: 0,
    activeUsers: 0,
    recentActivity: [],
    topFacilities: [],
    userGrowth: 0,
    revenueData: 0,
    systemHealth: 0,
    apiCalls: 0,
    errorRate: 0,
    avgResponseTime: 0,
    databaseSize: 0,
    activeSessions: 0,
    newRegistrations: 0,
    bookingsToday: 0,
    paymentsProcessed: 0
  });

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData({
        totalUsers: 1234,
        totalHospitals: 45,
        totalPharmacies: 67,
        activeUsers: 892,
        userGrowth: 12.5,
        revenueData: 45678,
        systemHealth: 98.2,
        apiCalls: 45678,
        errorRate: 1.2,
        avgResponseTime: 145,
        databaseSize: 2.3,
        activeSessions: 234,
        newRegistrations: 45,
        bookingsToday: 89,
        paymentsProcessed: 156,
        recentActivity: [
          { id: 1, user: 'Admin User', action: 'Created new hospital', time: '2 mins ago', type: 'create' },
          { id: 2, user: 'Manager', action: 'Updated pharmacy details', time: '15 mins ago', type: 'update' },
          { id: 3, user: 'System', action: 'New user registered', time: '1 hour ago', type: 'register' },
          { id: 4, user: 'Admin', action: 'Deactivated facility', time: '2 hours ago', type: 'deactivate' },
          { id: 5, user: 'Dr. Smith', action: 'Booked appointment', time: '3 hours ago', type: 'booking' },
          { id: 6, user: 'Payment System', action: 'Processed payment', time: '4 hours ago', type: 'payment' },
          { id: 7, user: 'API Service', action: 'API call spike detected', time: '5 hours ago', type: 'system' },
          { id: 8, user: 'User123', action: 'Updated profile', time: '6 hours ago', type: 'update' }
        ],
        topFacilities: [
          { name: 'City General Hospital', type: 'hospital', rating: 4.8, visits: 1234, revenue: 45678 },
          { name: 'Central Pharmacy', type: 'pharmacy', rating: 4.6, visits: 987, revenue: 23456 },
          { name: 'Medical Center', type: 'hospital', rating: 4.7, visits: 876, revenue: 34567 },
          { name: 'Emergency Care Unit', type: 'hospital', rating: 4.9, visits: 765, revenue: 56789 },
          { name: 'Family Pharmacy', type: 'pharmacy', rating: 4.5, visits: 654, revenue: 12345 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, trend, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📊 Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Monitor system performance and user activity
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={analyticsData.totalUsers}
            icon={<People />}
            trend={analyticsData.userGrowth}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={analyticsData.activeUsers}
            icon={<Assessment />}
            trend={8}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hospitals"
            value={analyticsData.totalHospitals}
            icon={<LocalHospital />}
            trend={5}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pharmacies"
            value={analyticsData.totalPharmacies}
            icon={<LocalPharmacy />}
            trend={-2}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`$${analyticsData.revenueData.toLocaleString()}`}
            icon={<Payment />}
            trend={15}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="API Calls"
            value={analyticsData.apiCalls.toLocaleString()}
            icon={<Speed />}
            trend={22}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Health"
            value={`${analyticsData.systemHealth}%`}
            icon={<MonitorHeart />}
            trend={0.5}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bookings Today"
            value={analyticsData.bookingsToday}
            icon={<BookOnline />}
            trend={12}
            color="primary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Activity
              </Typography>
              <Box>
                <IconButton size="small">
                  <Refresh />
                </IconButton>
                <IconButton size="small">
                  <FilterList />
                </IconButton>
                <IconButton size="small">
                  <Download />
                </IconButton>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={
                            activity.type === 'create' ? 'success' :
                            activity.type === 'update' ? 'info' :
                            activity.type === 'deactivate' ? 'error' :
                            activity.type === 'booking' ? 'primary' :
                            activity.type === 'payment' ? 'warning' :
                            activity.type === 'system' ? 'secondary' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Facilities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Top Performing Facilities
              </Typography>
              <IconButton size="small">
                <Download />
              </IconButton>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Facility</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Visits</TableCell>
                    <TableCell>Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topFacilities.map((facility, index) => (
                    <TableRow key={index}>
                      <TableCell>{facility.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={facility.type}
                          size="small"
                          color={facility.type === 'hospital' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{facility.rating}</TableCell>
                      <TableCell>{facility.visits}</TableCell>
                      <TableCell>${facility.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* System Metrics */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Performance
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Speed color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Avg Response Time" 
                  secondary={`${analyticsData.avgResponseTime}ms`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AnalyticsIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Error Rate" 
                  secondary={`${analyticsData.errorRate}%`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MonitorHeart color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="System Health" 
                  secondary={`${analyticsData.systemHealth}%`} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Database Stats
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Assessment color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Database Size" 
                  secondary={`${analyticsData.databaseSize} GB`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <People color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Active Sessions" 
                  secondary={analyticsData.activeSessions} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Timeline color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="API Calls Today" 
                  secondary={analyticsData.apiCalls.toLocaleString()} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Summary
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <People color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="New Registrations" 
                  secondary={analyticsData.newRegistrations} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BookOnline color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Bookings Today" 
                  secondary={analyticsData.bookingsToday} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Payment color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Payments Processed" 
                  secondary={analyticsData.paymentsProcessed} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
