import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  CircularProgress 
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';

const DayTimes = ({ selectedDay, dayTimes, hebrewDate }) => {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <AccessTime sx={{ mr: 1 }} />
        זמני היום {selectedDay && hebrewDate ? `- ${hebrewDate}` : ''}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {dayTimes ? (
        <Box>
          {Object.entries(dayTimes).map(([label, time]) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight={label === 'הדלקת נרות' || label === 'הבדלה' ? 'bold' : 'normal'}>
                {label}:
              </Typography>
              <Typography variant="body1" fontWeight="bold">{time || 'N/A'}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Paper>
  );
};

export default DayTimes;