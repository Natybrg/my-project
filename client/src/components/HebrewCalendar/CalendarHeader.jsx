import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { getHebrewMonthName } from './utils';

const CalendarHeader = ({ selectedDate, onPrevWeek, onNextWeek }) => {
  // קבלת החודש הנוכחי מהתאריך הנבחר
  const currentMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  const currentYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  
  // שם החודש בעברית
  const hebrewMonthName = getHebrewMonthName(currentMonth);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <IconButton onClick={onPrevWeek} size="large" color="primary">
        <ChevronRight />
      </IconButton>
      
      <Typography variant="h5" component="h1" fontWeight="bold" sx={{ textAlign: 'center' }}>
        {hebrewMonthName} {currentYear}
      </Typography>
      
      <IconButton onClick={onNextWeek} size="large" color="primary">
        <ChevronLeft />
      </IconButton>
    </Box>
  );
};

export default CalendarHeader;