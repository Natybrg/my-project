import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { Notifications, Event } from '@mui/icons-material';
import { formatDateKey } from './utils';

const Reminders = ({ reminders, selectedDay }) => {
  // סינון תזכורות ליום הנבחר
  const selectedDateKey = formatDateKey(selectedDay);
  const dayReminders = reminders.filter(reminder => 
    formatDateKey(new Date(reminder.date)) === selectedDateKey
  );

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
              <ListItem alignItems="flex-start">
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
                        <Typography variant="caption" component="div" sx={{ mt: 1 }}>
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
    </Paper>
  );
};

export default Reminders;