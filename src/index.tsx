import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CsrfProvider } from './contexts/CsrfContext';
import { SearchProvider } from './contexts/SearchContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import './index.css';
import { io, Socket } from 'socket.io-client';

// Function to safely toggle dark mode
function applyDarkMode(isDark: boolean) {
  try {
    localStorage.setItem('admin:darkMode', isDark ? '1' : '0');
  } catch {}
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

// Initialize socket connection
function initSocket() {
  try {
    const socket: Socket = io('https://backend-6tzt.onrender.com', { query: { admin: '1' } });
    socket.on('connect', () => {
      try { socket.emit('register', { role: 'admin' }); } catch {}
    });

    socket.on('settings_updated', (payload: { darkMode?: boolean }) => {
      if (payload?.darkMode !== undefined) {
        applyDarkMode(!!payload.darkMode);
      }
    });
  } catch {}
}

// Fetch initial dark mode and render app
async function initAndRender() {
  initSocket();

  try {
    const res = await fetch('https://backend-6tzt.onrender.com/api/admin/settings');
    if (res.ok) {
      const data = await res.json();
      if (data?.darkMode !== undefined) applyDarkMode(!!data.darkMode);
      else fallbackDarkMode();
    } else {
      fallbackDarkMode();
    }
  } catch {
    fallbackDarkMode();
  }

  const theme = createTheme({
    palette: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    },
  });

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <CsrfProvider>
            <AuthProvider>
              <SearchProvider>
                <ToastProvider>
                  <ConfirmProvider>
                    <App />
                  </ConfirmProvider>
                </ToastProvider>
              </SearchProvider>
            </AuthProvider>
          </CsrfProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

// Fallback dark mode using localStorage or prefers-color-scheme
function fallbackDarkMode() {
  const saved = localStorage.getItem('admin:darkMode');
  if (saved === '1') applyDarkMode(true);
  else if (saved === '0') applyDarkMode(false);
  else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) applyDarkMode(true);
}

initAndRender();
