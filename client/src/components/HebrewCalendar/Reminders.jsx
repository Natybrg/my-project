import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { Notifications, MoreVert, Edit, Delete } from '@mui/icons-material';
import { formatDateKey } from './utils';
import { deleteReminder } from '../../services/reminderService';
import ReminderForm from './ReminderForm';
import { jwtDecode } from 'jwt-decode';

const Reminders = ({ reminders, selectedDay, onReminderUpdate }) => {
  // סינון תזכורות ליום הנבחר
  const selectedDateKey = formatDateKey(selectedDay);
  
  const dayReminders = reminders.filter(reminder => {
    if (!reminder || !reminder.date) {
      return false;
    }
    
    try {
      const reminderDate = new Date(reminder.date);
      
      if (isNaN(reminderDate.getTime())) {
        return false;
      }
      
      const reminderDateKey = formatDateKey(reminderDate);
      return reminderDateKey === selectedDateKey;
    } catch (error) {
      return false;
    }
  });
  
  // בדיקת הרשאות משתמש
  const [isManager, setIsManager] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return ['admin', 'manager'].includes(decoded.role);
      } catch (error) {
        return false;
      }
    }
    return false;
  });

  // סטייט למנהל התפריט
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);

  const handleMenuOpen = (event, reminder) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReminder(reminder);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReminder(selectedReminder._id);
      onReminderUpdate?.();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleEditClick = () => {
    handleMenuClose();
    setEditFormOpen(true);
  };

  const handleEditFormClose = () => {
    setEditFormOpen(false);
  };

  const handleEditSuccess = () => {
    onReminderUpdate?.();
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, direction: 'ltr' }}>
      {/* כותרת עם אייקון התראות */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Notifications sx={{ ml: 1 }} />
        <Typography variant="h6">
          תזכורות ליום {selectedDay.toLocaleDateString('he-IL')}
        </Typography>
      </Box>
  
      {dayReminders.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {dayReminders.map((reminder, index) => (
            <React.Fragment key={reminder._id}>
              {index > 0 && <Divider />}
              <ListItem 
                sx={{ 
                  p: 0,
                  pt: 1, 
                  pb: 1,
                  position: 'relative'
                }}
              >
                {/* זמן התזכורת */}
                <Box sx={{ 
                  width: '70px', 
                  minWidth: '70px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  ml: 2
                }}>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(reminder.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                
                {/* תוכן התזכורת */}
                <Box sx={{ width: '100%', pl: isManager ? 5 : 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Notifications sx={{ ml: 1, fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight="bold" sx={{ ml: 1 }}>
                      {reminder.title}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ ml: 1 }}></Typography>
                    <Typography variant="body1">
                      {reminder.description}
                    </Typography>
                  </Box>
                  
                  {/* יוצר התזכורת */}
                  {reminder.createdBy && (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      נוצר ע"י: {reminder.createdBy.firstName} {reminder.createdBy.lastName}
                    </Typography>
                  )}
                </Box>
                
                {/* כפתור פעולות למנהל */}
                {isManager && (
                  <Box sx={{ 
                    position: 'absolute', 
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    <IconButton onClick={(e) => handleMenuOpen(e, reminder)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          אין תזכורות ליום זה
        </Typography>
      )}
  
      {/* תפריט פעולות */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { direction: 'ltr' }
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Edit fontSize="small" sx={{ ml: 1 }} />
          ערוך תזכורת
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete fontSize="small" sx={{ ml: 1 }} />
          מחק תזכורת
        </MenuItem>
      </Menu>
  
      {/* דיאלוג אישור מחיקה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        PaperProps={{
          sx: { direction: 'ltr' }
        }}
      >
        <DialogTitle>מחיקת תזכורת</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את התזכורת "{selectedReminder?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button onClick={handleDeleteDialogClose} color="inherit">ביטול</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>מחק</Button>
        </DialogActions>
      </Dialog>
  
      {/* טופס עריכת תזכורת */}
      <ReminderForm
        open={editFormOpen}
        onClose={handleEditFormClose}
        selectedDate={selectedDay}
        editReminder={selectedReminder}
        onSuccess={handleEditSuccess}
      />
    </Paper>
  );
};

export default Reminders;