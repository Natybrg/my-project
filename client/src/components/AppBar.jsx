import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { AccountCircle, Home, Payment, Settings, Dashboard, AccessTime } from '@mui/icons-material'; // הוספת אייקון AccessTime
import { useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

// Remove unused imports (Settings was imported but not used)

const CustomAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userName, setUserName] = useState('אורח');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
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
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const firstName = localStorage.getItem('firstName');
      const userRole = localStorage.getItem('userRole');
      
      if (token && userId) {
        setIsLoggedIn(true);
        setUserName(firstName || 'משתמש');
        // Check for all possible admin roles
        setIsAdmin(['admin', 'gabai', 'manager'].includes(userRole));
      } else {
        setIsLoggedIn(false);
        setUserName('אורח');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking user login status:', error);
      setIsLoggedIn(false);
      setUserName('אורח');
      setIsAdmin(false);
    }
  };

  // פתיחת תפריט משתמש
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // סגירת תפריט משתמש
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // פתיחת חלון התחברות
  const handleLoginOpen = () => {
    setLoginOpen(true);
  };

  // סגירת חלון התחברות
  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  // פתיחת חלון הרשמה
  const handleSignupOpen = () => {
    setSignupOpen(true);
  };

  // סגירת חלון הרשמה
  const handleSignupClose = () => {
    setSignupOpen(false);
  };

  // התנתקות
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setUserName('אורח');
    setIsAdmin(false);
    setAnchorEl(null);
    
    // פרסום אירוע שינוי משתמש
    window.dispatchEvent(new Event('userChange'));
    
    // ניווט לדף הבית
    navigate('/');
  };

  // ניווט לדף
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* לוגו ושם האתר - עכשיו בצד ימין */}
        <Typography variant="h6" component="div">
          אתר לניהול בית כנסת
        </Typography>
        
        {/* מרווח גמיש שידחוף את כפתורי הניווט למרכז */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* כפתורי ניווט - עכשיו במרכז */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            startIcon={<Home />}
            onClick={() => navigateTo('/')}
            sx={{ 
              backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            }}
          >
            דף הבית
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<AccessTime />}
            onClick={() => navigateTo('/day-times')}
            sx={{ 
              backgroundColor: location.pathname === '/day-times' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            }}
          >
            זמני היום
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<Payment />}
            onClick={() => navigateTo('/payment')}
            sx={{ 
              backgroundColor: location.pathname === '/payment' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            }}
          >
            תשלומים
          </Button>
          
          {isAdmin && (
            <Button 
              color="inherit" 
              startIcon={<Dashboard />}
              onClick={() => navigateTo('/admin')}
              sx={{ 
                backgroundColor: location.pathname.startsWith('/admin') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
              }}
            >
              ניהול
            </Button>
          )}
        </Box>

        {/* מרווח גמיש שידחוף את אזור המשתמש לצד שמאל */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* אזור משתמש - עכשיו בצד שמאל */}
        <Box>
          {isLoggedIn ? (
            <>
              <Chip
                avatar={<Avatar>{userName.charAt(0)}</Avatar>}
                label={userName}
                onClick={handleMenuOpen}
                color="default"
                sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
                }}
              />
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
                <MenuItem onClick={() => { handleMenuClose(); navigateTo('/profile'); }}>פרופיל</MenuItem>
                <MenuItem onClick={handleLogout}>התנתק</MenuItem>
              </Menu>
            </>
          ) : (
            <Chip
              avatar={<Avatar><AccountCircle /></Avatar>}
              label="אורח"
              onClick={handleLoginOpen}
              color="default"
              sx={{ 
                color: 'white', 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
              }}
            />
          )}
        </Box>
      </Toolbar>
      
      {/* מודלים */}
      <LoginModal open={loginOpen} onClose={handleLoginClose} onSignupClick={() => { handleLoginClose(); handleSignupOpen(); }} />
      <SignupModal 
        open={signupOpen} 
        onClose={handleSignupClose} 
        onLoginClick={() => { handleSignupClose(); handleLoginOpen(); }}
      />
    </AppBar>
  );
};

export default CustomAppBar;