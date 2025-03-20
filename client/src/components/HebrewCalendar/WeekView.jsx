import React from 'react';
import { 
  Paper, 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Grid,
  Badge
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { formatDateKey, getHebrewDayName, formatHebrewDate } from './utils';

const WeekView = ({ weekDates, selectedDay, hebrewDates, holidays, onDaySelect, reminders }) => {
  // פונקציה לבדיקה אם יש תזכורות ביום מסוים
  const hasRemindersForDay = (date) => {
    const dateKey = formatDateKey(date);
    return reminders.some(reminder => formatDateKey(new Date(reminder.date)) === dateKey);
  };

  return (
    <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }} dir="rtl">
      <Grid container>
        {weekDates.map((date, index) => {
          const dateKey = formatDateKey(date);
          const isToday = formatDateKey(new Date()) === dateKey;
          const isSelected = formatDateKey(selectedDay) === dateKey;
          const hebrewDate = hebrewDates[dateKey] || {};
          const holiday = holidays[dateKey];
          const dayReminders = reminders.filter(reminder => formatDateKey(new Date(reminder.date)) === dateKey);
          
          return (
            <Grid 
              item 
              key={dateKey} 
              xs 
              onClick={() => onDaySelect(date)}
              sx={{
                p: 1,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: isSelected 
                  ? 'primary.main'
                  : isToday 
                    ? 'rgba(25, 118, 210, 0.08)'
                    : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected 
                    ? 'primary.dark'
                    : 'rgba(25, 118, 210, 0.12)'
                },
                borderLeft: index < 6 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: isSelected ? '#ffffff' : 'text.secondary',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}
              >
                {getHebrewDayName(date.getDay())}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  my: 1,
                  color: isSelected ? '#ffffff' : 'text.primary',
                  fontWeight: isSelected ? 'bold' : 'medium'
                }}
              >
                {date.getDate()}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isSelected ? '#ffffff' : 'text.secondary',
                  fontSize: '0.75rem'
                }}
              >
                {formatHebrewDate(hebrewDate)}
              </Typography>
              {holiday && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 0.5, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: isSelected ? '#ffffff' : 'primary.main'
                  }}
                >
                  {holiday}
                </Typography>
              )}
              {dayReminders.length > 0 && (
                <Box 
                  sx={{ 
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main'
                    }}
                  />
                </Box>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default WeekView;