import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/he'; // יבוא תמיכה בעברית

// במקום:
// import { heIL } from 'date-fns/locale';

// יש לייבא את הלוקאל העברי כך:
import he from 'date-fns/locale/he';
import { addReminder, updateReminder } from '../../services/reminderService';

const ReminderForm = ({ open, onClose, selectedDate, editReminder = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: editReminder?.title || '',
    description: editReminder?.description || '',
    date: editReminder?.date ? new Date(editReminder.date) : selectedDate || new Date()
  });
  
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
      if (editReminder) {
        await updateReminder(editReminder._id, formData);
      } else {
        await addReminder(formData);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editReminder ? 'עריכת תזכורת' : 'הוספת תזכורת חדשה'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="כותרת"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="תיאור"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
            <DateTimePicker
              label="תאריך ושעה"
              value={dayjs(formData.date)}
              onChange={(newDate) => handleChange('date', newDate.toDate())}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.date}
                  helperText={errors.date}
                />
              )}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          ביטול
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'שומר...' : editReminder ? 'עדכן' : 'הוסף'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderForm;