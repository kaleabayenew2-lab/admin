import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 6,
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              FindMed
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connecting patients with healthcare facilities across the region. Your trusted medical directory.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="primary" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="primary" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="primary" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/about" color="text.secondary" underline="hover">
                About Us
              </Link>
              <Link href="/hospitals" color="text.secondary" underline="hover">
                Hospitals
              </Link>
              <Link href="/pharmacies" color="text.secondary" underline="hover">
                Pharmacies
              </Link>
              <Link href="/emergency" color="text.secondary" underline="hover">
                Emergency
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="text.secondary" underline="hover">
                Help Center
              </Link>
              <Link href="/contact" color="text.secondary" underline="hover">
                Contact Us
              </Link>
              <Link href="/feedback" color="text.secondary" underline="hover">
                Feedback
              </Link>
              <Link href="/terms" color="text.secondary" underline="hover">
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="action" />
                <Typography variant="body2" color="text.secondary">
                  123 Medical Plaza, Health City, HC 12345
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="action" />
                <Typography variant="body2" color="text.secondary">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="action" />
                <Typography variant="body2" color="text.secondary">
                  info@findmed.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} FindMed Inc. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" color="text.secondary" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="/cookie-consent" color="text.secondary" underline="hover" variant="body2">
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
