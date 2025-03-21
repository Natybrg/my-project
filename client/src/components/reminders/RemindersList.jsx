import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NotificationsActive as AlertIcon
} from '@mui/icons-material';

const RemindersList = ({ reminders = [], isAdmin = false, onEdit, onDelete }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <EventIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h6" component="div" fontWeight={600}>
          הערות חשובות
        </Typography>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mr: -1,
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.1,
            borderRadius: '3px',
          },
        }}
      >
        <List sx={{ py: 0 }}>
          {reminders.length > 0 ? (
            reminders.map((reminder, index) => (
              <ListItem
                key={reminder.id || index}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'background.default',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.main}10`,
                    transform: 'translateX(-4px)'
                  }
                }}
                secondaryAction={
                  isAdmin && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onEdit?.(reminder)}
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDelete?.(reminder.id)}
                        sx={{
                          color: theme.palette.error.main,
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlertIcon 
                        sx={{ 
                          fontSize: 20, 
                          color: reminder.important ? theme.palette.error.main : theme.palette.warning.main 
                        }} 
                      />
                      <Typography variant="subtitle1" fontWeight={500}>
                        {reminder.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 0.5,
                        color: theme.palette.text.secondary,
                        lineHeight: 1.4
                      }}
                    >
                      {reminder.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box
              sx={{
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography>אין הערות חשובות</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default RemindersList; 