import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const SynagogueInfo = ({ 
  synagogueData = {
    name: '',
    rabbi: '',
    contact: {
      phone: '',
      email: ''
    },
    description: '',
    announcements: []
  },
  isAdmin = false,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(synagogueData);

  const handleEdit = () => {
    setEditedData(synagogueData);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave?.(editedData);
    setIsEditing(false);
  };

  const handleChange = (field) => (event) => {
    setEditedData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleContactChange = (field) => (event) => {
    setEditedData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: event.target.value
      }
    }));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {synagogueData.name || ''}
          </Typography>
          <Typography variant="body1" component="div" color="text.secondary">
            {synagogueData.description || ''}
          </Typography>
        </Box>
        {isAdmin && (
          <IconButton onClick={handleEdit} color="primary">
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          צור קשר
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(synagogueData.contact?.phone || synagogueData.contact?.email) && (
            <>
              {synagogueData.contact?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="primary" />
                  <Typography component="span">
                    {synagogueData.contact.phone}
                  </Typography>
                </Box>
              )}
              {synagogueData.contact?.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="primary" />
                  <Typography component="span">
                    {synagogueData.contact.email}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {synagogueData.announcements?.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              הודעות חשובות
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {synagogueData.announcements.map((announcement, index) => (
                <Chip
                  key={index}
                  label={announcement}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Dialog for editing */}
      <Dialog open={isEditing} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          עריכת פרטי בית הכנסת
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="שם בית הכנסת"
              fullWidth
              value={editedData.name || ''}
              onChange={handleChange('name')}
            />
            <TextField
              label="תיאור"
              fullWidth
              multiline
              rows={4}
              value={editedData.description || ''}
              onChange={handleChange('description')}
            />
            <TextField
              label="טלפון"
              fullWidth
              value={editedData.contact?.phone || ''}
              onChange={handleContactChange('phone')}
            />
            <TextField
              label="דוא״ל"
              fullWidth
              value={editedData.contact?.email || ''}
              onChange={handleContactChange('email')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SynagogueInfo; 