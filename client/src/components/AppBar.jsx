import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Box 
} from '@mui/material';
import { AccountCircle, Home, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const CustomAppBar = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleOpenLogin = () => setLoginOpen(true);
  const handleCloseLogin = () => setLoginOpen(false);
  const handleOpenSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };
  const handleCloseSignup = () => setSignupOpen(false);

  return (
    <>
      <AppBar position="static" dir="rtl">
        <Toolbar>
          <IconButton 
            color="inherit"
            onClick={handleOpenLogin}
            sx={{ mr: 2 }}
          >
            <AccountCircle />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              startIcon={<Home />}
            >
              בית
            </Button>
            
            <Button 
              color="inherit" 
              onClick={() => navigate('/payment')}
              startIcon={<Payment />}
            >
              תשלומים
            </Button>
          </Box>

          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              borderRight: '2px solid white',
              paddingRight: 2
            }}
          >
            מערכת עליות
          </Typography>
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