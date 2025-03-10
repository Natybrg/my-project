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
import { formatDateKey, getHebrewDayName } from './utils';

const WeekView = ({ weekDates, selectedDay, hebrewDates, holidays, onDaySelect, reminders }) => {
  // פונקציה לבדיקה אם יש תזכורות ביום מסוים
  const hasRemindersForDay = (date) => {
    const dateKey = formatDateKey(date);
    return reminders.some(reminder => formatDateKey(new Date(reminder.date)) === dateKey);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Grid container spacing={1}>
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date);
          const isSelected = formatDateKey(selectedDay) === dateKey;
          const isToday = formatDateKey(new Date()) === dateKey;
          const hebrewDate = hebrewDates[dateKey];
          const holiday = holidays[dateKey];
          const hasReminders = hasRemindersForDay(date);
          
          return (
            <Grid item xs={12} sm={6} md={3} lg={12/7} key={dateKey}>
              <Card 
                elevation={isSelected ? 6 : 1}
                sx={{
                  border: isToday ? '2px solid #3f51b5' : 'none',
                  backgroundColor: isSelected ? 'rgba(63, 81, 181, 0.08)' : 'white'
                }}
              >
                <CardActionArea onClick={() => onDaySelect(date)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="div">
                        {getHebrewDayName(date.getDay())}
                      </Typography>
                      {hasReminders && (
                        <Badge color="secondary" variant="dot">
                          <Notifications fontSize="small" />
                        </Badge>
                      )}
                    </Box>
                    
                    <Typography variant="h5" component="div" sx={{ textAlign: 'center', my: 1 }}>
                      {date.getDate()}
                    </Typography>
                    
                    {hebrewDate && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        {hebrewDate.split(' ').slice(0, 2).join(' ')}
                      </Typography>
                    )}
                    
                    {holiday && (
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          textAlign: 'center', 
                          mt: 1,
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      >
                        {holiday}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default WeekView;