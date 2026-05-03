import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  Map,
  Assessment,
  Description,
  Business,
  LocalHospital,
  LocalPharmacy,
  People,
  VpnKey,
  Article,
  Campaign,
  Chat,
  Feedback,
  Settings,
  Info,
  Gavel,
  Help,
  ContactMail,
  Analytics,
  MenuBook,
  Api,
} from '@mui/icons-material';

export default function Sidebar({ open, onClose, topOffset = 64 }: { open: boolean; onClose: () => void; topOffset?: number }) {
  const loc = useLocation();
  const topPaths = new Set(['/map', '/reports', '/settings']);
  const allItems = [
    // Fixed: changed '/Dashboard' to '/dashboard'
    { to: '/', label: 'Home', icon: <Dashboard /> }, // Fixed: changed label from 'Dashboard' to 'Home' to avoid duplicate
    { to: '/map', label: 'Map', icon: <Map /> },
    { to: '/reports', label: 'Reports', icon: <Assessment /> },
    { to: '/analytics', label: 'Analytics', icon: <Analytics /> },
    { to: '/books', label: 'Book Management', icon: <MenuBook /> },
    { to: '/api_controls', label: 'API Control', icon: <Api /> },
    { to: '/hospitals', label: 'Hospitals', icon: <LocalHospital /> },
    { to: '/pharmacies', label: 'Pharmacies', icon: <LocalPharmacy /> },
    { to: '/users', label: 'Users', icon: <People /> },
    { to: '/content', label: 'Content', icon: <Article /> },
    { to: '/ads', label: 'Ads', icon: <Campaign /> },
    { to: '/chat', label: 'Chat', icon: <Chat /> },
    { to: '/feedback', label: 'Feedback', icon: <Feedback /> },
    { to: '/settings', label: 'Settings', icon: <Settings /> },
    { to: '/about', label: 'About', icon: <Info /> },
    { to: '/terms', label: 'Terms', icon: <Gavel /> },
    { to: '/help', label: 'Help', icon: <Help /> },
    { to: '/legal', label: 'Legal & Trust', icon: <Gavel /> },
    { to: '/contact', label: 'Contact', icon: <ContactMail /> }
  ];
  // exclude top-nav items so they're not duplicated in the sidebar
  const items = allItems.filter(it => !topPaths.has(it.to));

  const drawerContent = (
    <Box sx={{ width: 280, pt: `${topOffset}px` }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >
          A
        </Box>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        {items.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={loc.pathname === item.to}
              onClick={onClose}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: loc.pathname === item.to ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
    >
      {drawerContent}
    </Drawer>
  );
}