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
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Api,
  Security,
  Settings,
  Refresh,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  Key,
  Timeline,
  Warning,
  CheckCircle,
  Error,
  Search
} from '@mui/icons-material';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  status: 'active' | 'inactive' | 'error';
  lastCalled: string;
  responseTime: number;
  requests: number;
  errors: number;
  requiresAuth: boolean;
  rateLimit: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive';
  created: string;
  lastUsed: string;
  requests: number;
}

interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  userAgent: string;
  ip: string;
  error?: string;
}

export default function ApiControl() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openKeyDialog, setOpenKeyDialog] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);

  useEffect(() => {
    // Simulate loading API data
    setTimeout(() => {
      setEndpoints([
        {
          id: '1',
          name: 'Get Facilities',
          method: 'GET',
          path: '/api/facilities',
          status: 'active',
          lastCalled: '2024-03-15 10:30:00',
          responseTime: 120,
          requests: 1234,
          errors: 0,
          requiresAuth: true,
          rateLimit: 100
        },
        {
          id: '2',
          name: 'Create Facility',
          method: 'POST',
          path: '/api/facilities',
          status: 'active',
          lastCalled: '2024-03-15 10:25:00',
          responseTime: 250,
          requests: 567,
          errors: 2,
          requiresAuth: true,
          rateLimit: 50
        },
        {
          id: '3',
          name: 'Send OTP',
          method: 'POST',
          path: '/api/otp/send',
          status: 'error',
          lastCalled: '2024-03-15 10:20:00',
          responseTime: 5000,
          requests: 234,
          errors: 45,
          requiresAuth: false,
          rateLimit: 10
        },
        {
          id: '4',
          name: 'Delete Facility',
          method: 'DELETE',
          path: '/api/facilities/:id',
          status: 'inactive',
          lastCalled: '2024-03-15 09:45:00',
          responseTime: 150,
          requests: 89,
          errors: 1,
          requiresAuth: true,
          rateLimit: 25
        }
      ]);

      setApiKeys([
        {
          id: '1',
          name: 'Admin API Key',
          key: 'sk-admin-1234567890abcdef',
          permissions: ['read', 'write', 'delete'],
          status: 'active',
          created: '2024-01-01',
          lastUsed: '2024-03-15 10:30:00',
          requests: 5432
        },
        {
          id: '2',
          name: 'Read Only Key',
          key: 'sk-readonly-0987654321fedcba',
          permissions: ['read'],
          status: 'active',
          created: '2024-02-15',
          lastUsed: '2024-03-15 09:15:00',
          requests: 1234
        },
        {
          id: '3',
          name: 'Mobile App Key',
          key: 'sk-mobile-5432109876zyxwvu',
          permissions: ['read', 'write'],
          status: 'inactive',
          created: '2024-03-01',
          lastUsed: '2024-03-10 14:20:00',
          requests: 789
        }
      ]);

      setLogs([
        {
          id: '1',
          timestamp: '2024-03-15 10:30:15',
          endpoint: '/api/facilities',
          method: 'GET',
          status: 200,
          responseTime: 120,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ip: '192.168.1.100'
        },
        {
          id: '2',
          timestamp: '2024-03-15 10:29:45',
          endpoint: '/api/otp/send',
          method: 'POST',
          status: 500,
          responseTime: 5000,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ip: '192.168.1.101',
          error: 'Email service unavailable'
        },
        {
          id: '3',
          timestamp: '2024-03-15 10:28:30',
          endpoint: '/api/facilities/123',
          method: 'PUT',
          status: 200,
          responseTime: 250,
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          ip: '192.168.1.102'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleToggleEndpoint = (endpointId: string) => {
    setEndpoints(prev => prev.map(endpoint =>
      endpoint.id === endpointId
        ? { ...endpoint, status: endpoint.status === 'active' ? 'inactive' : 'active' }
        : endpoint
    ));
  };

  const handleToggleApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key =>
      key.id === keyId
        ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
        : key
    ));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'info';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(log =>
    log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔧 API Control Center
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Monitor and manage API endpoints, keys, and system performance
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Endpoints
              </Typography>
              <Typography variant="h4">
                {endpoints.length}
              </Typography>
              <Api color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Endpoints
              </Typography>
              <Typography variant="h4" color="success.main">
                {endpoints.filter(e => e.status === 'active').length}
              </Typography>
              <CheckCircle color="success" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                API Keys
              </Typography>
              <Typography variant="h4" color="info.main">
                {apiKeys.length}
              </Typography>
              <Key color="info" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Error Rate
              </Typography>
              <Typography variant="h4" color="error.main">
                {logs.filter(l => l.status >= 400).length}
              </Typography>
              <Error color="error" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Endpoints" />
          <Tab label="API Keys" />
          <Tab label="Logs" />
          <Tab label="Email" />
          <Tab label="Payment" />
          <Tab label="Reset" />
          <Tab label="Telegram Bot" />
        </Tabs>
      </Paper>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={`Search ${activeTab === 0 ? 'endpoints' : activeTab === 1 ? 'API keys' : activeTab === 2 ? 'logs' : activeTab === 3 ? 'email settings' : activeTab === 4 ? 'payment settings' : activeTab === 5 ? 'reset settings' : 'telegram bot settings'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tab 0: Endpoints */}
      {activeTab === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Path</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Requests</TableCell>
                  <TableCell>Errors</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell>{endpoint.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={endpoint.method}
                        size="small"
                        color={getMethodColor(endpoint.method)}
                      />
                    </TableCell>
                    <TableCell>
                      <code>{endpoint.path}</code>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={endpoint.status}
                        size="small"
                        color={getStatusColor(endpoint.status)}
                      />
                    </TableCell>
                    <TableCell>{endpoint.responseTime}ms</TableCell>
                    <TableCell>{endpoint.requests}</TableCell>
                    <TableCell>{endpoint.errors}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleToggleEndpoint(endpoint.id)}>
                        {endpoint.status === 'active' ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <IconButton size="small">
                        <Refresh />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 1: API Keys */}
      {activeTab === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requests</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>
                      <code>{apiKey.key.substring(0, 20)}...</code>
                    </TableCell>
                    <TableCell>
                      {apiKey.permissions.map(permission => (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={apiKey.status}
                        size="small"
                        color={apiKey.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{apiKey.requests}</TableCell>
                    <TableCell>{apiKey.lastUsed}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleToggleApiKey(apiKey.id)}>
                        {apiKey.status === 'active' ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Logs */}
      {activeTab === 2 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>User Agent</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>
                      <code>{log.endpoint}</code>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.method}
                        size="small"
                        color={getMethodColor(log.method)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={log.status >= 400 ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{log.responseTime}ms</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.userAgent}
                    </TableCell>
                    <TableCell>
                      {log.error && (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {log.error}
                        </Alert>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 3: Email */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📧 Email Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="SMTP Server"
                    defaultValue="smtp.gmail.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Port"
                    defaultValue="587"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    defaultValue="noreply@example.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    defaultValue="••••••••"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable TLS"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth>
                    Save Email Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📊 Email Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Sent Today
                      </Typography>
                      <Typography variant="h4">245</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Failed
                      </Typography>
                      <Typography variant="h4" color="error">3</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth startIcon={<Refresh />}>
                    Test Email Service
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Payment */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                💳 Payment Gateway Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Provider</InputLabel>
                    <Select defaultValue="stripe">
                      <MenuItem value="stripe">Stripe</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="square">Square</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Key"
                    type="password"
                    defaultValue="sk_test_••••••••••••••"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook Secret"
                    type="password"
                    defaultValue="whsec_••••••••••••••"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Test Mode"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth>
                    Save Payment Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                💰 Transaction History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>2024-03-15</TableCell>
                      <TableCell>$29.99</TableCell>
                      <TableCell><Chip label="Success" color="success" size="small" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-03-14</TableCell>
                      <TableCell>$49.99</TableCell>
                      <TableCell><Chip label="Failed" color="error" size="small" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 5: Reset */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                🔄 System Reset Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Configure automatic reset schedules and manual reset options.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable Daily Data Reset"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reset Time"
                    type="time"
                    defaultValue="02:00"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch />}
                    label="Reset User Sessions"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch />}
                    label="Reset Cache"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="warning" fullWidth>
                    Save Reset Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                ⚠️ Manual Reset Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button variant="outlined" color="primary" fullWidth>
                    Reset User Sessions
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" color="secondary" fullWidth>
                    Clear Cache
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" color="info" fullWidth>
                    Reset Failed Jobs
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" color="warning" fullWidth>
                    Reset API Statistics
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" color="error" fullWidth>
                    Emergency Reset All
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 6: Telegram Bot */}
      {activeTab === 6 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                🤖 Telegram Bot Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bot Token"
                    type="password"
                    defaultValue="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bot Username"
                    defaultValue="@my_bot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    defaultValue="https://example.com/api/telegram/webhook"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable Bot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch />}
                    label="Debug Mode"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth>
                    Save Bot Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📊 Bot Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Active Users
                      </Typography>
                      <Typography variant="h4">1,234</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Messages Today
                      </Typography>
                      <Typography variant="h4">567</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth startIcon={<Refresh />}>
                    Test Bot Connection
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" fullWidth>
                    Send Test Message
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
