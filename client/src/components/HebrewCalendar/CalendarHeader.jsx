import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const CalendarHeader = ({ onPrevWeek, onNextWeek }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4">לוח שנה עברי</Typography>
      <Box>
        <IconButton onClick={onPrevWeek}>
          <ChevronRight />
        </IconButton>
        <IconButton onClick={onNextWeek}>
          <ChevronLeft />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CalendarHeader;