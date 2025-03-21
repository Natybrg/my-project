import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Synagogue as SynagogueIcon,
  Star as StarIcon
} from '@mui/icons-material';

const RemindersList = ({ reminders = [] }) => {
  const theme = useTheme();

  const formatTime = (date) => {
    if (!date) return '';
    const timeObj = new Date(date);
    return timeObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  // פונקציה להחזרת אייקון מתאים לפי סוג התזכורת
  const getReminderIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'שיעור':
        return <SchoolIcon color="primary" />;
      case 'תפילה':
        return <SynagogueIcon color="primary" />;
      case 'אירוע':
        return <PeopleIcon color="primary" />;
      case 'חשוב':
        return <StarIcon color="error" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  // פונקציה להחזרת צבע צ'יפ לפי סוג התזכורת
  const getChipColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'שיעור':
        return 'primary';
      case 'תפילה':
        return 'secondary';
      case 'אירוע':
        return 'success';
      case 'חשוב':
        return 'error';
      default:
        return 'default';
    }
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
        width: '100%',
        height: 200,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EventIcon color="primary" />
        <Typography variant="h6" component="div" fontWeight={700}>
          הערות חשובות
        </Typography>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[300],
            borderRadius: '4px',
          },
        }}
      >
        {reminders.length > 0 ? (
          <List sx={{ py: 0 }}>
            {reminders.map((reminder) => (
              <ListItem
                key={reminder._id}
                sx={{
                  mb: 1,
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: theme.palette.grey[100],
                    transform: 'translateY(-2px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <ListItemIcon>
                  {getReminderIcon(reminder.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" component="div" fontWeight={600}>
                        {reminder.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={formatTime(reminder.date)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={<TimeIcon />}
                          sx={{ minWidth: 90 }}
                        />
                        <Chip
                          label={reminder.type || 'כללי'}
                          size="small"
                          color={getChipColor(reminder.type)}
                          variant="outlined"
                          sx={{ minWidth: 70 }}
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      component="div" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 0.5,
                        lineHeight: 1.4
                      }}
                    >
                      {reminder.description}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
              color: 'text.secondary'
            }}
          >
            <NotificationsIcon sx={{ fontSize: 40, opacity: 0.5 }} />
            <Typography variant="body1" color="inherit">
              אין הערות חשובות להיום
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default RemindersList; 