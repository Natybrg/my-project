import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/he'; // יבוא תמיכה בעברית
import he from 'date-fns/locale/he';
import { addReminder, updateReminder } from '../../services/reminderService';

const ReminderForm = ({ open, onClose, selectedDate, editReminder = null, onSuccess }) => {
  // שימוש ב-useEffect כדי לאתחל את הטופס כאשר הוא נפתח
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: null
  });
  
  // אתחול הטופס כאשר הוא נפתח או כאשר הפרמטרים משתנים
  useEffect(() => {
    if (open) {
      setFormData({
        title: editReminder?.title || '',
        description: editReminder?.description || '',
        date: editReminder ? dayjs(editReminder.date) : dayjs(selectedDate)
      });
    }
  }, [open, editReminder, selectedDate]);
  
  const [errors, setErrors] = useState({
    title: '',
    date: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const validateForm = () => {
    const newErrors = {
      title: !formData.title ? 'כותרת היא שדה חובה' : '',
      date: !formData.date ? 'תאריך הוא שדה חובה' : ''
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // נקה שגיאות בעת הקלדה
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // הכנת האובייקט לשליחה - המרת התאריך לפורמט ISO, שמירה על אזור הזמן המקומי
      // ושמירה על הפורמט הנכון לתאריך ושעה
      let dateToSave = formData.date;
      
      // וידוא שהתאריך הוא אובייקט dayjs
      if (typeof dateToSave !== 'object' || !dateToSave.toISOString) {
        dateToSave = dayjs(dateToSave);
      }
      
      const reminderToSave = {
        title: formData.title,
        description: formData.description,
        date: dateToSave.toISOString() // המרה ל-ISO string
      };
      
      console.log('Saving reminder with date:', reminderToSave.date);
      
      if (editReminder) {
        await updateReminder(editReminder._id, reminderToSave);
      } else {
        await addReminder(reminderToSave);
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'אירעה שגיאה בשמירת התזכורת');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
    >
      <DialogTitle>
        {editReminder ? 'עריכת תזכורת' : 'הוספת תזכורת חדשה'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <TextField
            label="כותרת"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            margin="normal"
            inputProps={{ dir: 'rtl' }}
            InputProps={{ dir: 'rtl' }}
          />
          
          <TextField
            label="תיאור"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            margin="normal"
            inputProps={{ dir: 'rtl' }}
            InputProps={{ dir: 'rtl' }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
            <DateTimePicker 
              label="תאריך ושעה"
              value={formData.date}
              onChange={(value) => handleChange('date', value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  margin="normal" 
                  error={!!errors.date}
                  helperText={errors.date}
                  inputProps={{ 
                    ...params.inputProps,
                    dir: 'rtl'
                  }}
                  InputProps={{ 
                    ...params.InputProps,
                    dir: 'rtl'
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="secondary">
          ביטול
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (editReminder ? 'עדכון' : 'הוספה')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderForm;