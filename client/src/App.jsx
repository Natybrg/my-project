import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import CustomAppBar from './components/AppBar';
import PaymentPage from './pages/PaymentPage';
import HomePage from './pages/HomePage';
import DataforShabat from './pages/DataforShabat';
import UserManagementPage from './RolsPages/gabai/Management';
import AdminPage from './pages/AdminPage';
import UserDebtsPage from './pages/UserDebtsPage';
import DayTimesPage from './pages/DayTimesPage'; // ייבוא הדף החדש
import theme from './theme';
import cacheRtl from './cacheRtl';
import './App.css';

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
              <Route path="/day-times" element={<DayTimesPage />} /> {/* הוספת הנתיב החדש */}
              {/* דפי ניהול מוגנים - אם משתמש לא מורשה מנסה לגשת, הוא יועבר לדף הבית */}
              <Route path="/admin/*" element={<ProtectedRouteAdmin />} />
              <Route path="/profile" element={<div>פרופיל</div>} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
}

// רכיב להגנה על נתיבי מנהל
const ProtectedRouteAdmin = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userRole = localStorage.getItem('userRole');
      // Allow admin, gabai, and manager roles to access admin routes
      const isAuthorizedRole = userRole === 'admin' || userRole === 'gabai' || userRole === 'manager';
      
      setIsAuthorized(isAuthorizedRole);
      setLoading(false);
      
      if (!isAuthorizedRole) {
        navigate('/');
      }
    };
    
    checkAuth();
    
    // האזנה לשינויים במשתמש
    const handleUserChange = () => checkAuth();
    window.addEventListener('userChange', handleUserChange);
    
    return () => {
      window.removeEventListener('userChange', handleUserChange);
    };
  }, [navigate]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>טוען...</div>;
  }

  if (!isAuthorized) {
    return null; // המשתמש יועבר לדף הבית
  }

  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/management" element={<UserManagementPage />} />
      <Route path="/debts" element={<UserDebtsPage />} />
    </Routes>
  );
};

export default App;