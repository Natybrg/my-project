import React from 'react';
import { 
  Paper, 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Grid 
} from '@mui/material';
import { formatDateKey, getHebrewDayName } from './utils';

const WeekView = ({ weekDates, selectedDay, hebrewDates, holidays, onDaySelect }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      {/* Day Labels */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
          <Grid item xs={12 / 7} key={index}>
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'text.secondary',
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Grid */}
      <Grid container spacing={1}>
        {weekDates.map((date) => {
          const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString();
          const hebrewDate = hebrewDates[formatDateKey(date)] || '';
          const holiday = holidays[formatDateKey(date)] || '';

          return (
            <Grid item xs={12 / 7} key={date.toISOString()}>
              <Card
                sx={{
                  backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                  border: isSelected ? '2px solid' : '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  height: '100px', // Fixed height for uniformity
                }}
                onClick={() => onDaySelect(date)}
              >
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        textAlign: 'center',
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        color: holiday ? 'error.main' : 'text.secondary',
                      }}
                    >
                      {hebrewDate}
                    </Typography>
                    {holiday && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          color: 'error.main',
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