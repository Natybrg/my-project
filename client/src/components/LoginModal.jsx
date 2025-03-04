import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { login, getUserDetails } from "../services/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  direction: "rtl",
  borderRadius: 2
};

const LoginModal = ({ open, onClose, onSignupClick }) => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    phone: false,
    password: false
  });

  const [errors, setErrors] = useState({
    phone: "",
    password: ""
  });

  const [generalError, setGeneralError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Reset form function
  const resetForm = () => {
    setFormData({
      phone: "",
      password: "",
    });
    setTouched({
      phone: false,
      password: false
    });
    setErrors({
      phone: "",
      password: ""
    });
    setGeneralError("");
  };

  const validateField = (name, value, isSubmitting = false) => {
    if (!isSubmitting && !touched[name] && !value) return '';

    switch (name) {
      case 'phone':
        return (!value || !/^\d{10}$/.test(value)) ? 
          'מספר טלפון חייב להכיל בדיוק 10 ספרות' : '';
      case 'password':
        return (!value || value.length < 6) ? 
          'סיסמה חייבת להכיל לפחות 6 תווים' : '';
      default:
        return '';
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      phone: true,
      password: true
    });
  
    const newErrors = {};
    let hasErrors = false;
  
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field], true);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });
  
    setErrors(newErrors);
  
    if (!hasErrors) {
      try {
        const data = await login(formData.phone, formData.password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        
        // שמירת שם המשתמש אם קיים בתגובה
        if (data.firstName) {
          localStorage.setItem('firstName', data.firstName);
        } 
        // אם אין שם משתמש בתגובה, נסה לקבל אותו בבקשה נפרדת
        else {
          try {
            const userDetails = await getUserDetails(data.userId);
            if (userDetails && userDetails.firstName) {
              localStorage.setItem('firstName', userDetails.firstName);
            }
          } catch (detailsError) {
            console.error('שגיאה בקבלת פרטי משתמש:', detailsError);
            // לא נציג שגיאה למשתמש כי ההתחברות כבר הצליחה
          }
        }
        
        resetForm(); // Reset form after successful login
        onClose();
        window.dispatchEvent(new Event('userChange'));
      } catch (error) {
        setGeneralError(error.message);
      }
    }
  };

  // Handle signup click with form reset
  const handleSignupClick = () => {
    resetForm();
    onSignupClick();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>
          התחברות
        </Typography>

        {generalError && ( // הצגת הודעת שגיאה כללית
          <Typography color="error" variant="body2" mb={2}>
            {generalError}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            label="מספר טלפון"
            variant="outlined"
            margin="normal"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            autoComplete="tel"
          />

          <TextField
            required
            fullWidth
            label="סיסמה"
            type="password"
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            התחבר
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={handleSignupClick} // Changed to use the new handler
          >
            אין לך חשבון? הירשם כאן
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default LoginModal;