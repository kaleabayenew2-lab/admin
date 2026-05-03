import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Badge,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  LocalHospital,
  LocalPharmacy,
  ZoomIn,
  ZoomOut,
  MyLocation,
  Layers,
  ViewList,
  ViewModule,
  Refresh,
  Directions,
  Phone,
  Email,
  AccessTime,
  Star,
  MoreVert,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { MapContainer, Marker, Popup, useMap, ZoomControl, TileLayer, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import facilityApi, { Facility } from '../services/facilityApi';

// Enhanced marker icons
const createCustomIcon = (color: string) => L.divIcon({
  html: `
    <div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">📍</div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const hospitalIcon = createCustomIcon('#e74c3c');
const pharmacyIcon = createCustomIcon('#3498db');
const defaultIcon = createCustomIcon('#95a5a6');


function MapControls({ onZoomIn, onZoomOut, onCenter, onToggleView }: any) {
  return (
    <Box sx={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      <Paper sx={{ borderRadius: 2 }}>
        <IconButton onClick={onZoomIn} size="small">
          <ZoomIn />
        </IconButton>
        <IconButton onClick={onZoomOut} size="small">
          <ZoomOut />
        </IconButton>
        <Divider />
        <IconButton onClick={onCenter} size="small">
          <MyLocation />
        </IconButton>
        <IconButton onClick={onToggleView} size="small">
          <Layers />
        </IconButton>
      </Paper>
    </Box>
  );
}

function FitBounds({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = facilities
      .filter(f => f.location && f.location.coordinates && f.location.coordinates.length === 2)
      .map(f => [f.location!.coordinates[1], f.location!.coordinates[0]] as [number, number]);
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Set default center and zoom if no facilities
      map.setView([9.0054, 38.7578], 12);
    }
  }, [facilities, map]);
  return null;
}

export default function MapManagement() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [ownership, setOwnership] = useState('all');
  const [showMap, setShowMap] = useState(true);
  const [mapStyle, setMapStyle] = useState('default');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [route, setRoute] = useState<{from: {lat: number, lng: number}, to: {lat: number, lng: number}, coordinates: [number, number][]} | null>(null);
  const mapRef = useRef<any>(null);

  // Load facilities from backend API
  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const facilitiesData = await facilityApi.getFacilities();
      setFacilities(facilitiesData);
    } catch (error) {
      console.error('Error loading facilities:', error);
      setError('Failed to load facilities. Please try again.');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    let filtered = facilities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (facility.address && facility.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }

    // Filter by selected facility
    if (showOnlySelected && selectedFacility) {
      filtered = filtered.filter(facility => facility.id === selectedFacility.id);
    }

    // Filter by ownership
    if (ownership !== 'all') {
      filtered = filtered.filter(facility => facility.ownership === ownership);
    }

    return filtered;
  }, [facilities, searchTerm, selectedType, ownership, showOnlySelected, selectedFacility]);

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital': return hospitalIcon;
      case 'pharmacy': return pharmacyIcon;
      default: return defaultIcon;
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setView(mapRef.current.getCenter(), mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setView(mapRef.current.getCenter(), mapRef.current.getZoom() - 1);
    }
  };

  const handleCenter = () => {
    if (mapRef.current && filteredFacilities.length > 0) {
      const validFacilities = filteredFacilities.filter(f => f.location?.coordinates);
      if (validFacilities.length > 0) {
        const center = validFacilities[0].location.coordinates;
        mapRef.current.setView([center[1], center[0]], 12);
      }
    }
  };

  const handleToggleView = () => {
    setShowMap(!showMap);
  };

  const handleFacilitySelect = (facility: Facility) => {
    if (selectedFacility?.id === facility.id) {
      // If clicking the same facility, toggle show all
      setSelectedFacility(null);
      setShowOnlySelected(false);
    } else {
      // Select new facility and show only selected
      setSelectedFacility(facility);
      setShowOnlySelected(true);
    }
  };

  const handleShowAll = () => {
    setSelectedFacility(null);
    setShowOnlySelected(false);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Addis Ababa coordinates
          setCurrentLocation({ lat: 9.0054, lng: 38.7636 });
        }
      );
    } else {
      // Fallback to Addis Ababa coordinates
      setCurrentLocation({ lat: 9.0054, lng: 38.7636 });
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Handle get directions with road-based routing
  const handleGetDirections = (facility: Facility) => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }
    
    if (facility.location?.coordinates) {
      console.log('Getting directions for facility:', facility.name);
      console.log('From location:', currentLocation);
      console.log('To location:', facility.location.coordinates);
      
      // Use OpenRouteService for actual road routing
      const start = `${currentLocation.lng},${currentLocation.lat}`;
      const end = `${facility.location.coordinates[0]},${facility.location.coordinates[1]}`;
      
      // Create route using OpenRouteService
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false&geometries=geojson&steps=true`;
      console.log('Requesting route from:', url);
      
      fetch(url)
        .then(response => {
          console.log('Route response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Route data:', data);
          
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            console.log('Route found:', route);
            
            // Check if route.geometry and coordinates exist
            if (route.geometry && route.geometry.coordinates) {
              const coordinates = route.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);
              console.log('Route coordinates:', coordinates);
              
              setRoute({
                from: currentLocation,
                to: { 
                  lat: facility.location.coordinates[1], 
                  lng: facility.location.coordinates[0] 
                },
                coordinates: coordinates
              });
              
              // Fit map to show the entire route
              if (mapRef.current) {
                const bounds = L.latLngBounds([
                  [currentLocation.lat, currentLocation.lng],
                  [facility.location.coordinates[1], facility.location.coordinates[0]]
                ]);
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
              }
            } else {
              console.error('Route geometry not found in response');
              // Fallback to straight line
              setRoute({
                from: currentLocation,
                to: { 
                  lat: facility.location.coordinates[1], 
                  lng: facility.location.coordinates[0] 
                },
                coordinates: [
                  [currentLocation.lat, currentLocation.lng],
                  [facility.location.coordinates[1], facility.location.coordinates[0]]
                ]
              });
            }
          } else {
            console.error('No routes found in response');
            // Fallback to straight line
            setRoute({
              from: currentLocation,
              to: { 
                lat: facility.location.coordinates[1], 
                lng: facility.location.coordinates[0] 
              },
              coordinates: [
                [currentLocation.lat, currentLocation.lng],
                [facility.location.coordinates[1], facility.location.coordinates[0]]
              ]
            });
          }
        })
        .catch(error => {
          console.error('Error getting directions:', error);
          // Fallback to straight line if routing fails
          setRoute({
            from: currentLocation,
            to: { 
              lat: facility.location.coordinates[1], 
              lng: facility.location.coordinates[0] 
            },
            coordinates: [
              [currentLocation.lat, currentLocation.lng],
              [facility.location.coordinates[1], facility.location.coordinates[0]]
            ]
          });
        });
    }
  };

  // Get directions for selected facility
  useEffect(() => {
    if (selectedFacility && currentLocation) {
      handleGetDirections(selectedFacility);
    }
  }, [selectedFacility, currentLocation]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        🗺️ Interactive Facility Map
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Explore hospitals and pharmacies on the map with advanced filtering and search capabilities
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Facilities
                      </Typography>
                      <Typography variant="h4">
                        {facilities.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <LocationOn />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Hospitals
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {facilities.filter(f => f.type === 'hospital').length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                      <LocalHospital />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Pharmacies
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {facilities.filter(f => f.type === 'pharmacy').length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                      <LocalPharmacy />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Filtered Results
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {filteredFacilities.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                      <FilterList />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Map Section */}
        {showMap && (
          <Grid item xs={12}>
            <Paper sx={{ height: 500, position: 'relative', zIndex: 1, mb: 3 }}>
              <MapContainer
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                <FitBounds facilities={filteredFacilities} />
                
                {filteredFacilities.map((facility) => (
                  facility.location?.coordinates && (
                    <Marker
                      key={facility.id}
                      position={[facility.location.coordinates[1], facility.location.coordinates[0]]}
                    >
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography variant="h6" gutterBottom>
                            {facility.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {facility.address}
                          </Typography>
                          {currentLocation && facility.location?.coordinates && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                              📍 Distance: {calculateDistance(
                                currentLocation.lat, 
                                currentLocation.lng, 
                                facility.location.coordinates[1], 
                                facility.location.coordinates[0]
                              ).toFixed(2)} km
                            </Typography>
                          )}
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={facility.type}
                              size="small"
                              color={facility.type === 'hospital' ? 'error' : 'info'}
                            />
                                                      </Box>
                          {facility.phone && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              📞 {facility.phone}
                            </Typography>
                          )}
                          {facility.openingHours && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              🕒 {facility.openingHours}
                            </Typography>
                          )}
                          <Box sx={{ mt: 2 }}>
                            <Button 
                              variant="contained" 
                              size="small" 
                              fullWidth
                              onClick={() => handleGetDirections(facility)}
                              startIcon={<LocationOn />}
                            >
                              Get Directions
                            </Button>
                          </Box>
                        </Box>
                      </Popup>
                    </Marker>
                  )
                ))}
              
              {/* Current Location Marker */}
              {currentLocation && (
                <Marker position={[currentLocation.lat, currentLocation.lng]}>
                  <Popup>
                    <Box sx={{ p: 1, minWidth: 150 }}>
                      <Typography variant="h6" gutterBottom>
                        Your Location
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>
              )}
              
              {/* Route Line */}
              {route && route.coordinates && (
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{
                    color: "blue",
                    weight: 4,
                    opacity: 0.7
                  }}
                />
              )}
              </MapContainer>
              
              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onCenter={handleCenter}
                onToggleView={handleToggleView}
              />
            </Paper>
          </Grid>
        )}

        {/* Filters and Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search facilities..."
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
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Facility Type</InputLabel>
                  <Select
                    value={selectedType}
                    label="Facility Type"
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="hospital">Hospitals</MenuItem>
                    <MenuItem value="pharmacy">Pharmacies</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Ownership</InputLabel>
                  <Select
                    value={ownership}
                    label="Ownership"
                    onChange={(e) => setOwnership(e.target.value)}
                  >
                    <MenuItem value="all">All Ownership</MenuItem>
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMap}
                      onChange={(e) => setShowMap(e.target.checked)}
                    />
                  }
                  label="Show Map"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<MyLocation />}
                    onClick={getCurrentLocation}
                  >
                    Get Location
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Refresh />}
                    onClick={loadFacilities}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button variant="outlined" startIcon={<ViewList />}>
                    List View
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Error Display */}
        {error && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body1">
                  {error}
                </Typography>
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<Refresh />}
                  onClick={loadFacilities}
                  disabled={loading}
                >
                  Retry
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Facility List */}
        <Grid item xs={12}>
          <Paper sx={{ height: showMap ? 400 : 'auto', overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Facility List ({filteredFacilities.length})
                {showOnlySelected && selectedFacility && (
                  <Chip 
                    label={`Selected: ${selectedFacility.name}`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              {showOnlySelected && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleShowAll}
                  startIcon={<FilterList />}
                >
                  Show All
                </Button>
              )}
            </Box>
            <TableContainer sx={{ maxHeight: showMap ? 300 : 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Facility</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Ownership</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFacilities.map((facility) => (
                    <TableRow 
                      key={facility.id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: showOnlySelected && selectedFacility?.id === facility.id ? 'action.selected' : 'inherit',
                        '&:hover': {
                          backgroundColor: showOnlySelected && selectedFacility?.id === facility.id ? 'action.selectedHover' : 'action.hover'
                        }
                      }}
                      onClick={() => handleFacilitySelect(facility)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: facility.type === 'hospital' ? 'error.main' : 'info.main', width: 32, height: 32 }}>
                            {facility.type === 'hospital' ? <LocalHospital fontSize="small" /> : <LocalPharmacy fontSize="small" />}
                          </Avatar>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {facility.name}
                            </Typography>
                            {showOnlySelected && selectedFacility?.id === facility.id && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                sx={{ fontSize: '10px', height: 20 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={facility.type}
                          size="small"
                          color={facility.type === 'hospital' ? 'error' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={facility.ownership || 'N/A'}
                          size="small"
                          color={facility.ownership === 'public' ? 'success' : 'warning'}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {facility.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {facility.phone && (
                          <Typography variant="caption" display="block">
                            📞 {facility.phone}
                          </Typography>
                        )}
                        {facility.email && (
                          <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                            ✉️ {facility.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {facility.openingHours || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          No Rating
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}