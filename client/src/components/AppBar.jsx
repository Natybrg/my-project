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
import { AccountCircle, Home, Payment, Settings, Dashboard } from '@mui/icons-material';
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

  const handleOpenLogin = () => {
    setAnchorEl(null);
    setLoginOpen(true);
  };
  
  const handleCloseLogin = (loggedIn = false) => {
    setLoginOpen(false);
    if (loggedIn) {
      checkUserLoggedIn();
    }
  };
  
  const handleOpenSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };
  
  const handleCloseSignup = (registered = false) => {
    setSignupOpen(false);
    if (registered) {
      setLoginOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserName('אורח');
    setIsAdmin(false);
    setAnchorEl(null);
    window.dispatchEvent(new Event('userChange'));
    navigate('/');  // חזרה לדף הבית אחרי התנתקות
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  // Check if the current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <AppBar position="static" dir="rtl">
        <Toolbar>
          {/* שם המשתמש והאייקון בצד ימין */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: isLoggedIn ? 'primary.main' : 'grey.500', width: 32, height: 32, mr: 1 }}>
              {userName.charAt(0)}
            </Avatar>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                marginRight: 1
              }}
            >
              {userName}
            </Typography>
          </Box>

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
          {isAdmin && (
            <Button 
              color="inherit" 
              onClick={() => navigate('/admin')}
              startIcon={<Dashboard />}
              sx={{ ml: 1, fontWeight: isActive('/admin') ? 'bold' : 'normal' }}
              variant={isActive('/admin') ? "outlined" : "text"}
            >
              ניהול
            </Button>
          )}

          <Button 
            color="inherit" 
            onClick={() => navigate('/payment')}
            startIcon={<Payment />}
            sx={{ ml: 1, fontWeight: isActive('/payment') ? 'bold' : 'normal' }}
            variant={isActive('/payment') ? "outlined" : "text"}
          >
            תשלומים
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            startIcon={<Home />}
            sx={{ fontWeight: isActive('/') ? 'bold' : 'normal' }}
            variant={isActive('/') ? "outlined" : "text"}
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
              <>
                <MenuItem onClick={handleProfileClick}>פרופיל</MenuItem>
                {isAdmin && (
                  <MenuItem onClick={() => {
                    setAnchorEl(null);
                    navigate('/admin');
                  }}>ניהול מערכת</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>התנתק</MenuItem>
              </>
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