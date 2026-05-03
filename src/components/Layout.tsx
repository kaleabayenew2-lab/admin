import React, { useState } from 'react';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import { LoadingProvider } from '../contexts/LoadingContext';
import { ConnectionProvider } from '../contexts/ConnectionContext';
import ConnectionBanner from './ConnectionBanner';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import { Box, Paper, Container } from '@mui/material';

export default function Layout({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <ConnectionProvider>
      <LoadingProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', color: 'text.primary' }}>
          {showNav && <NavBar onToggle={() => setSidebarOpen(s => !s)} isOpen={sidebarOpen} />}
          <ConnectionBanner />
          <Box sx={{ display: 'flex' }}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(s => !s)} topOffset={showNav ? 64 : 0} />
            <Box
              component="main"
              onClick={() => setSidebarOpen(false)}
              sx={{
                flexGrow: 1,
                minHeight: '100vh',
                p: 0,
                ml: showNav && sidebarOpen ? { md: '256px' } : 0,
                transition: 'margin-left 0.3s ease',
                cursor: sidebarOpen ? 'pointer' : 'default',
              }}
            >
              {showNav && <Breadcrumbs />}
              <Container maxWidth="xl" sx={{ py: 3 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    minHeight: 'calc(100vh - 200px)',
                  }}
                >
                  <ErrorBoundary>{children}</ErrorBoundary>
                </Paper>
              </Container>
              <Footer />
            </Box>
          </Box>
        </Box>
      </LoadingProvider>
    </ConnectionProvider>
  );
}
