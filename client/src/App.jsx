import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import CustomAppBar from './components/appbar'; // Ensure the casing matches the actual file name
import PaymentPage from './pages/PaymentPage';
import HomePage from './pages/HomePage';
import DataforShabat from './pages/DataforShabat';
// Update the import path to ensure it's correct
import UserManagementPage from './RolsPages/gabai/Management';
import AdminPage from './pages/AdminPage';
import UserDebtsPage from './pages/UserDebtsPage';
import SynagogueLocationPage from './pages/SynagogueLocationPage';
import DayTimesPage from './pages/DayTimesPage';
import theme from './theme';
import cacheRtl from './cacheRtl';
import './App.css';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <CustomAppBar />
          <div className="page-container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/about" element={<DataforShabat />} />
              <Route path="/day-times" element={<DayTimesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Protected admin routes */}
              <Route path="/admin/*" element={<ProtectedRouteAdmin />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
}

// Protected route component for admin pages
const ProtectedRouteAdmin = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userRole = localStorage.getItem('userRole');
      console.log('Current user role:', userRole); // Debugging log
      
      // Allow admin, gabai, and manager roles to access admin routes
      const isAuthorizedRole = userRole === 'admin' || userRole === 'gabai' || userRole === 'manager';
      
      setIsAuthorized(isAuthorizedRole);
      setLoading(false);
      
      if (!isAuthorizedRole) {
        navigate('/');
      }
    };
    
    checkAuth();
    
    // Listen for user changes
    const handleUserChange = () => checkAuth();
    window.addEventListener('userChange', handleUserChange);
    
    return () => {
      window.removeEventListener('userChange', handleUserChange);
    };
  }, [navigate]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthorized) {
    return null; // Redirect to home page
  }

  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/management" element={<UserManagementPage />} />
      <Route path="/debts" element={<UserDebtsPage />} />
      <Route path="/location" element={<SynagogueLocationPage />} />
    </Routes>
  );
};

export default App;