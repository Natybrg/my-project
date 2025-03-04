import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { register } from "../services/api";

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

const SignupModal = ({ open, onClose, onLoginClick }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    fatherName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [touched, setTouched] = useState({
    firstName: false,
    fatherName: false,
    lastName: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({
    firstName: "",
    fatherName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: ""
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
      firstName: "",
      fatherName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
    setTouched({
      firstName: false,
      fatherName: false,
      lastName: false,
      phone: false,
      password: false,
      confirmPassword: false
    });
    setErrors({
      firstName: "",
      fatherName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
    setGeneralError("");
  };
  const validateField = (name, value, isSubmitting = false) => {
    if (!isSubmitting && !touched[name] && !value) return '';
  switch (name) {
      case 'firstName':
      case 'fatherName':
      case 'lastName':
        return (!value || value.length < 2) ? 
          `${name === 'firstName' ? 'שם פרטי' : name === 'fatherName' ? 'שם האב' : 'שם משפחה'} חייב להכיל לפחות 2 תווים` : '';
      case 'phone':
        return (!value || !/^\d{10}$/.test(value)) ? 
          'מספר טלפון חייב להכיל בדיוק 10 ספרות' : '';
      case 'password':
        return (!value || value.length < 6) ? 
          'סיסמה חייבת להכיל לפחות 6 תווים' : '';
      case 'confirmPassword':
        return value !== formData.password ? 
          'הסיסמאות אינן תואמות' : '';
      default:
        return '';
    }
  };
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    
    if (name === 'password') {
      const confirmError = validateField('confirmPassword', formData.confirmPassword, true);
      setErrors(prev => ({ 
        ...prev, 
        [name]: error,
        confirmPassword: confirmError 
      }));
    } else {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // סימון כל השדות כ-touched
    setTouched({
      firstName: true,
      fatherName: true,
      lastName: true,
      phone: true,
      password: true,
      confirmPassword: true
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
    if (!hasErrors) {
      try {
        const { confirmPassword, ...registerData } = formData;
        const data = await register(registerData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('firstName', formData.firstName); // שמירת שם המשתמש
        resetForm(); // Reset form after successful registration
        onClose();
        window.dispatchEvent(new Event('userChange'));
      } catch (error) {
        const errorMessage = error.message || 'אירעה שגיאה בתהליך ההרשמה';
        console.error('Registration error:', error);
        setGeneralError(errorMessage);
      }
    }
  };
  // Handle login click with form reset
  const handleLoginClick = () => {
    resetForm();
    onLoginClick();
  };
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>
          הרשמה
        </Typography>
    
        {generalError && (
          <Typography color="error" variant="body2" mb={2}>
            {generalError}
          </Typography>
        )}
    <form onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            label="שם פרטי"
            variant="outlined"
            margin="normal"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />

          <TextField
            required
            fullWidth
            label="שם האב"
            variant="outlined"
            margin="normal"
            value={formData.fatherName}
            onChange={(e) => handleChange('fatherName', e.target.value)}
            error={!!errors.fatherName}
            helperText={errors.fatherName}
          />

          <TextField
            required
            fullWidth
            label="שם משפחה"
            variant="outlined"
            margin="normal"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />

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
          />

          <TextField
            required
            fullWidth
            label="אימות סיסמה"
            type="password"
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            הירשם
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={handleLoginClick} // Changed to use the new handler
          >
            כבר יש לך חשבון? התחבר כאן
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default SignupModal;