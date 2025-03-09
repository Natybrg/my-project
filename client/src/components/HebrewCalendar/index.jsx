import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  IconButton,
  CircularProgress,
  Grid
} from '@mui/material';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
import WeekView from './WeekView';
import DayTimes from './DayTimes';
import { fetchHebrewDates, fetchDayTimes } from './api';
import { formatDateKey } from './utils';

const HebrewCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date()); // Default to today's date
  const [dayTimes, setDayTimes] = useState(null);
  const [hebrewDates, setHebrewDates] = useState({});
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate the current week's dates
  useEffect(() => {
    const calculateWeekDates = () => {
      const dates = [];
      const firstDayOfWeek = new Date(currentDate);
      const day = currentDate.getDay();
      firstDayOfWeek.setDate(currentDate.getDate() - day);

      for (let i = 0; i < 7; i++) {
        const date = new Date(firstDayOfWeek);
        date.setDate(firstDayOfWeek.getDate() + i);
        dates.push(date);
      }

      setWeekDates(dates);
      loadHebrewDates(dates);

      // Automatically select today's date and fetch its times
      const today = new Date();
      const isTodayInWeek = dates.some(
        (date) =>
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
      );
      if (isTodayInWeek) {
        setSelectedDay(today);
        handleDaySelect(today);
      } else {
        setSelectedDay(dates[0]); // Default to the first day of the week
        handleDaySelect(dates[0]);
      }
    };

    calculateWeekDates();
  }, [currentDate]);

  // Load Hebrew dates and holidays
  const loadHebrewDates = async (dates) => {
    setLoading(true);
    setError(null);
    try {
      const hebrewDatesData = await fetchHebrewDates(dates);
      setHebrewDates(hebrewDatesData);
    } catch (error) {
      console.error('Failed to load Hebrew dates:', error);
      setError('Failed to load Hebrew dates. Please try again later.');
      setHebrewDates({});
    } finally {
      setLoading(false);
    }
  };

  // Handle day selection and fetch day times
  const handleDaySelect = async (date) => {
    setSelectedDay(date);
    setDayTimes(null);
    try {
      const times = await fetchDayTimes(date);
      setDayTimes(times);
    } catch (error) {
      console.error('Failed to load day times:', error);
      setError('Failed to load day times. Please try again later.');
      setDayTimes(null);
    }
  };

  // Navigate to the next week
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);

    // Retain the selected date if it exists in the new week
    const newWeekDates = weekDates.map((date) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 7);
      return newDate;
    });
    const isSelectedDayInNewWeek = newWeekDates.some(
      (date) =>
        date.getDate() === selectedDay.getDate() &&
        date.getMonth() === selectedDay.getMonth() &&
        date.getFullYear() === selectedDay.getFullYear()
    );
    if (!isSelectedDayInNewWeek) {
      setSelectedDay(newWeekDates[0]); // Default to the first day of the new week
      handleDaySelect(newWeekDates[0]);
    }
  };

  // Navigate to the previous week
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);

    // Retain the selected date if it exists in the new week
    const newWeekDates = weekDates.map((date) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - 7);
      return newDate;
    });
    const isSelectedDayInNewWeek = newWeekDates.some(
      (date) =>
        date.getDate() === selectedDay.getDate() &&
        date.getMonth() === selectedDay.getMonth() &&
        date.getFullYear() === selectedDay.getFullYear()
    );
    if (!isSelectedDayInNewWeek) {
      setSelectedDay(newWeekDates[0]); // Default to the first day of the new week
      handleDaySelect(newWeekDates[0]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          לוח שנה עברי
        </Typography>
        <Box>
          <IconButton onClick={prevWeek} aria-label="שבוע קודם">
            <ChevronRight />
          </IconButton>
          <IconButton onClick={nextWeek} aria-label="שבוע הבא">
            <ChevronLeft />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            טוען נתונים...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <WeekView 
              weekDates={weekDates} 
              selectedDay={selectedDay} 
              hebrewDates={hebrewDates}
              holidays={holidays}
              onDaySelect={handleDaySelect}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <DayTimes 
              selectedDay={selectedDay} 
              dayTimes={dayTimes} 
              hebrewDate={selectedDay ? hebrewDates[formatDateKey(selectedDay)] : ''}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default HebrewCalendar;