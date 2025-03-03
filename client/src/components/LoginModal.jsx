import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { login } from "../services/api";

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
        localStorage.setItem('token', data.token); // שמירת הטוקן
        localStorage.setItem('userId', data.userId); // שמירת userId
        onClose(); // סגירת המודל
        console.log('Login successful'); // הודעה בקונסול על התחברות מוצלחת
        window.dispatchEvent(new Event('userChange'));
      } catch (error) {
        setGeneralError(error.message); // עדכון הודעת השגיאה הכללית
      }
    }
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
            onClick={onSignupClick}
          >
            אין לך חשבון? הירשם כאן
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default LoginModal;