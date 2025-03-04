import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { AccountCircle, Home, Payment, Settings } from '@mui/icons-material';  // הוספת Settings
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const CustomAppBar = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userName, setUserName] = useState('אורח');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const pages = [
    { name: 'דף הבית', path: '/' },
    { name: 'תשלומים', path: '/payment' },
    { name: 'מידע', path: '/about' },
    { name: 'צור קשר', path: '/contact' },
    { name: 'ניהול', path: '/admin' } // הוספת כפתור ניהול לתפריט
  ];
  // בדיקה אם המשתמש מחובר בטעינת הקומפוננטה
  useEffect(() => {
    checkUserLoggedIn();
    
    // האזנה לשינויים במשתמש
    window.addEventListener('userChange', checkUserLoggedIn);
    
    return () => {
      window.removeEventListener('userChange', checkUserLoggedIn);
    };
  }, []);

  // פונקציה לבדיקה אם המשתמש מחובר
  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const firstName = localStorage.getItem('firstName');
    
    if (token && userId) {
      setIsLoggedIn(true);
      setUserName(firstName || 'משתמש');
    } else {
      setIsLoggedIn(false);
      setUserName('אורח');
    }
  };

  const handleOpenLogin = () => {
    setAnchorEl(null);
    setLoginOpen(true);
  };
  
  const handleCloseLogin = () => setLoginOpen(false);
  
  const handleOpenSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };
  
  const handleCloseSignup = () => setSignupOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    setIsLoggedIn(false);
    setUserName('אורח');
    setAnchorEl(null);
    window.dispatchEvent(new Event('userChange'));
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static" dir="rtl">
        <Toolbar>
          {/* שם המשתמש והאייקון בצד ימין */}
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              marginRight: 2
            }}
          >
            {userName}
          </Typography>

          {/* אייקון משתמש עם תפריט */}
          <IconButton 
            color="inherit"
            onClick={handleMenuOpen}
            title={isLoggedIn ? "אפשרויות משתמש" : "התחבר"}
            sx={{ mr: 2 }}
          >
            <AccountCircle />
          </IconButton>
          
          {/* מרווח גמיש */}
          <Box sx={{ flexGrow: 1 }} />

          {/* כפתורי ניווט בצד שמאל */}
          <Button 
            color="inherit" 
            onClick={() => navigate('/admin')}
            startIcon={<Settings />}
            sx={{ ml: 1 }}
          >
            ניהול
          </Button>

          <Button 
            color="inherit" 
            onClick={() => navigate('/payment')}
            startIcon={<Payment />}
            sx={{ ml: 1 }}
          >
            תשלומים
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            startIcon={<Home />}
          >
            בית
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {isLoggedIn ? (
              <MenuItem onClick={handleLogout}>התנתק</MenuItem>
            ) : (
              <MenuItem onClick={handleOpenLogin}>התחבר</MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <LoginModal 
        open={loginOpen} 
        onClose={handleCloseLogin}
        onSignupClick={handleOpenSignup}
      />
      
      <SignupModal 
        open={signupOpen} 
        onClose={handleCloseSignup}
        onLoginClick={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
};

export default CustomAppBar;