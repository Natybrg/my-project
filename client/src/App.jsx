import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import CustomAppBar from './components/AppBar';
import PaymentPage from './pages/PaymentPage';
import HomePage from './pages/HomePage';

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
          <Route path="/profile" element={<div>פרופיל</div>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;