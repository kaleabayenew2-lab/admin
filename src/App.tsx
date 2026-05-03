import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Login from './pages/Login';

// Lazy load all pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const TelegramPage = lazy(() => import('./pages/Telegram'));
const Hospitals = lazy(() => import('./pages/Hospitals'));
const Pharmacies = lazy(() => import('./pages/Pharmacies'));
const MapManagement = lazy(() => import('./pages/MapManagement'));
const Users = lazy(() => import('./pages/Users'));
const EmergencyManagement = lazy(() => import('./pages/EmergencyManagement'));
const Content = lazy(() => import('./pages/Content'));
const AdsPage = lazy(() => import('./pages/Ads'));
const ChatPage = lazy(() => import('./pages/Chat'));
const Feedback = lazy(() => import('./pages/Feedback'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminAll = lazy(() => import('./pages/AdminAll'));
const About = lazy(() => import('./pages/About'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const LegalAndTrust = lazy(() => import('./pages/LegalAndTrust'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const CookieConsent = lazy(() => import('./pages/CookieConsent'));
const Help = lazy(() => import('./pages/Help'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const BookManagement = lazy(() => import('./pages/BookManagement'));
const ApiControl = lazy(() => import('./pages/ApiControl'));

// Loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    fontSize: '16px',
    color: '#666'
  }}>
    Loading...
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/reports"
          element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>}
        />
        <Route
          path="/analytics"
          element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>}
        />
        <Route
          path="/books"
          element={<ProtectedRoute><Layout><BookManagement /></Layout></ProtectedRoute>}
        />
        <Route
          path="/api_controls"
          element={<ProtectedRoute><Layout><ApiControl /></Layout></ProtectedRoute>}
        />
        <Route
          path="/telegram"
          element={<ProtectedRoute><Layout><TelegramPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/hospitals"
          element={<ProtectedRoute><Layout><Hospitals /></Layout></ProtectedRoute>}
        />
        <Route
          path="/pharmacies"
          element={<ProtectedRoute><Layout><Pharmacies /></Layout></ProtectedRoute>}
        />
        <Route
          path="/map"
          element={<ProtectedRoute><Layout><MapManagement /></Layout></ProtectedRoute>}
        />
        <Route
          path="/users"
          element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>}
        />
        <Route
          path="/emergency"
          element={<ProtectedRoute><Layout><EmergencyManagement /></Layout></ProtectedRoute>}
        />
        <Route
          path="/content"
          element={<ProtectedRoute><Layout><Content /></Layout></ProtectedRoute>}
        />
        <Route
          path="/ads"
          element={<ProtectedRoute><Layout><AdsPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><Layout><ChatPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/feedback"
          element={<ProtectedRoute><Layout><Feedback /></Layout></ProtectedRoute>}
        />
                <Route
          path="/settings"
          element={<ProtectedRoute><Layout><AdminSettings /></Layout></ProtectedRoute>}
        />
        <Route
          path="/about"
          element={<Layout showNav={false}><About /></Layout>}
        />
        <Route
          path="/contact"
          element={<Layout><ContactUs /></Layout>}
        />
        <Route
          path="/help"
          element={<Layout showNav={false}><Help /></Layout>}
        />
        <Route
          path="/legal"
          element={<ProtectedRoute><Layout><LegalAndTrust /></Layout></ProtectedRoute>}
        />
        <Route
          path="/privacy"
          element={<Layout showNav={false}><PrivacyPolicy /></Layout>}
        />
        <Route
          path="/terms"
          element={<Layout><Terms /></Layout>}
        />
        <Route
          path="/cookie-consent"
          element={<Layout showNav={false}><CookieConsent /></Layout>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Layout showNav={false}><Profile /></Layout></ProtectedRoute>}
        />
        <Route
          path="/all"
          element={<ProtectedRoute><Layout><AdminAll /></Layout></ProtectedRoute>}
        />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Layout showNav={false}><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
}
