import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import CustomAppBar from './components/AppBar';
import PaymentPage from './pages/PaymentPage';
import HomePage from './pages/HomePage';
import DataforShabat from './pages/DataforShabat';
import UserManagementPage from './RolsPages/gabai/Management';
import AdminPage from './pages/AdminPage';  // הוספת import חדש

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif'
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <CustomAppBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/about" element={<DataforShabat />} />
          <Route path="/admin/management" element={<UserManagementPage/>} />
          <Route path="/profile" element={<div>פרופיל</div>} />
          <Route path="/admin" element={<AdminPage />} />  {/* דף ניהול ראשי */}
          {/* בעתיד תוכל להוסיף כאן נתיבים נוספים לדפי ניהול ספציפיים */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;