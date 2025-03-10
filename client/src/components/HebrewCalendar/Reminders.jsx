import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Chip,
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
import { Notifications, Event, MoreVert, Edit, Delete } from '@mui/icons-material';
import { formatDateKey } from './utils';
import { deleteReminder } from '../../services/reminderService';
import ReminderForm from './ReminderForm';
import { jwtDecode } from 'jwt-decode';

const Reminders = ({ reminders, selectedDay, onReminderUpdate }) => {
  // סינון תזכורות ליום הנבחר
  const selectedDateKey = formatDateKey(selectedDay);
  const dayReminders = reminders.filter(reminder => 
    formatDateKey(new Date(reminder.date)) === selectedDateKey
  );

  // בדיקת הרשאות משתמש
  const [isManager, setIsManager] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return ['admin', 'manager'].includes(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
        return false;
      }
    }
    return false;
  });

  // סטייט למנהל התפריט
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  
  // סטייט לדיאלוג מחיקה
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // סטייט לטופס עריכה
  const [editFormOpen, setEditFormOpen] = useState(false);

  // פתיחת תפריט
  const handleMenuOpen = (event, reminder) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReminder(reminder);
  };

  // סגירת תפריט
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // פתיחת דיאלוג מחיקה
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // סגירת דיאלוג מחיקה
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // מחיקת תזכורת
  const handleDeleteConfirm = async () => {
    try {
      await deleteReminder(selectedReminder._id);
      onReminderUpdate?.(); // רענון התזכורות
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  // פתיחת טופס עריכה
  const handleEditClick = () => {
    handleMenuClose();
    setEditFormOpen(true);
  };

  // סגירת טופס עריכה
  const handleEditFormClose = () => {
    setEditFormOpen(false);
  };

  // עדכון מוצלח של תזכורת
  const handleEditSuccess = () => {
    onReminderUpdate?.(); // רענון התזכורות
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Notifications sx={{ mr: 1 }} />
        תזכורות ליום {selectedDay.toLocaleDateString('he-IL')}
      </Typography>

      {dayReminders.length > 0 ? (
        <List>
          {dayReminders.map((reminder, index) => (
            <React.Fragment key={reminder._id}>
              {index > 0 && <Divider />}
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  isManager && (
                    <IconButton edge="end" onClick={(e) => handleMenuOpen(e, reminder)}>
                      <MoreVert />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {reminder.title}
                      </Typography>
                      <Chip 
                        size="small" 
                        icon={<Event />} 
                        label={new Date(reminder.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} 
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="text.primary">
                        {reminder.description}
                      </Typography>
                      {reminder.createdBy && (
                        <Typography variant="caption" component="span" sx={{ mt: 1, display: 'block' }}>
                          נוצר ע"י: {reminder.createdBy.firstName} {reminder.createdBy.lastName}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
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
      >
        <MenuItem onClick={handleEditClick}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          ערוך תזכורת
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          מחק תזכורת
        </MenuItem>
      </Menu>

      {/* דיאלוג אישור מחיקה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>מחיקת תזכורת</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את התזכורת "{selectedReminder?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="inherit">ביטול</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            מחק
          </Button>
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