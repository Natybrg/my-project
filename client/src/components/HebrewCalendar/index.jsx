import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  IconButton,
  CircularProgress,
  Grid,
  Button,
  Fab
} from '@mui/material';
import { ChevronRight, ChevronLeft, Add } from '@mui/icons-material';
import WeekView from './WeekView';
import DayTimes from './DayTimes';
import Reminders from './Reminders';
import ReminderForm from './ReminderForm';
import CalendarHeader from './CalendarHeader';
import { fetchHebrewDates, fetchDayTimes } from './api';
import { formatDateKey, getStartOfWeek } from './utils';
import { getRemindersByDateRange } from '../../services/reminderService';

// Change to named import
import { jwtDecode } from 'jwt-decode';

const HebrewCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [hebrewDates, setHebrewDates] = useState(() => {
    const initialDates = {};
    const today = new Date();
    for (let i = -7; i < 14; i++) { // Pre-initialize 3 weeks
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      initialDates[formatDateKey(date)] = {};
    }
    return initialDates;
  });
  const [holidays, setHolidays] = useState({});
  const [dayTimes, setDayTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [reminderFormOpen, setReminderFormOpen] = useState(false);

  // בדיקת הרשאות משתמש
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // בדיקה אם המשתמש הוא מנהל או אדמין
        setIsManager(['admin', 'manager'].includes(decoded.role));
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsManager(false);
      }
    }
  }, []);

  // חישוב תאריכי השבוע
  useEffect(() => {
    const startOfWeek = getStartOfWeek(selectedDay);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    setWeekDates(dates);
  }, [selectedDay]);

  // טעינת תאריכים עבריים וחגים
  useEffect(() => {
    if (weekDates.length > 0) {
      setLoading(true);
      
      const fetchData = async () => {
        try {
          // Rename the destructured variables to avoid shadowing state variables
          const { hebrewDates: fetchedHebrewDates, holidays: fetchedHolidays } = await fetchHebrewDates(weekDates);
          
          // Update state with fetched data
          setHebrewDates(fetchedHebrewDates || {});
          setHolidays(fetchedHolidays || {});
          
          // Initialize dayTimes with default values for each date in weekDates
          const initialDayTimes = {};
          weekDates.forEach(date => {
            const dateKey = formatDateKey(date);
            initialDayTimes[dateKey] = dayTimes[dateKey] || {}; // Use existing data if available
          });
          setDayTimes(initialDayTimes);
      
          // Fetch day times for the selected day
          const dayTimesData = await fetchDayTimes(selectedDay);
          setDayTimes(prev => ({
            ...prev,
            [formatDateKey(selectedDay)]: dayTimesData
          }));
          
          // Fetch reminders for the current week
          const startDate = weekDates[0];
          const endDate = weekDates[6];
          const remindersData = await getRemindersByDateRange(startDate, endDate);
          setReminders(remindersData);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching calendar data:', error);
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [weekDates]);

  // הסרת useEffect של לוגים לפני רינדור
  
  // טעינת זמני היום כאשר היום הנבחר משתנה
  useEffect(() => {
    const fetchDayTimesForSelectedDay = async () => {
      const dateKey = formatDateKey(selectedDay);
      
      if (!dayTimes[dateKey]) {
        try {
          const dayTimesData = await fetchDayTimes(selectedDay);
          setDayTimes(prev => ({
            ...prev,
            [dateKey]: dayTimesData
          }));
        } catch (error) {
          console.error('Error fetching day times:', error);
        }
      }
    };
    
    fetchDayTimesForSelectedDay();
  }, [selectedDay]);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDay);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDay(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDay);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDay(newDate);
  };

  const handleDaySelect = (date) => {
    setSelectedDay(date);
  };

  // פונקציה לרענון התזכורות לאחר הוספה/עדכון/מחיקה
  const refreshReminders = async () => {
    try {
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      const remindersData = await getRemindersByDateRange(startDate, endDate);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error refreshing reminders:', error);
    }
  };

  // פתיחת טופס הוספת תזכורת
  const handleAddReminder = () => {
    setReminderFormOpen(true);
  };

  // סגירת טופס תזכורת
  const handleCloseReminderForm = () => {
    setReminderFormOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
      <CalendarHeader onPrevWeek={handlePrevWeek} onNextWeek={handleNextWeek} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* תצוגת שבוע - תופס את כל הרוחב */}
          <Grid item xs={12}>
            <WeekView 
              weekDates={weekDates} 
              selectedDay={selectedDay} 
              hebrewDates={hebrewDates || {}}
              holidays={holidays || {}}
              onDaySelect={handleDaySelect}
              reminders={reminders}
            />
          </Grid>
          
          {/* שורה חדשה עם שני טורים */}
          <Grid item xs={12} md={6}>
            {dayTimes[formatDateKey(selectedDay)] && (
              <DayTimes 
                selectedDay={selectedDay} 
                dayTimes={dayTimes[formatDateKey(selectedDay)]} 
                hebrewDate={hebrewDates[formatDateKey(selectedDay)] || {}} 
              />
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Reminders 
              reminders={reminders} 
              selectedDay={selectedDay} 
              onReminderUpdate={refreshReminders}
            />
          </Grid>
        </Grid>
      )}
      
      {/* כפתור הוספת תזכורת למנהלים בלבד */}
      {isManager && (
        <Fab 
          color="primary" 
          aria-label="add reminder"
          onClick={handleAddReminder}
          sx={{ position: 'fixed', bottom: 16, left: 16 }}
        >
          <Add />
        </Fab>
      )}
      
      {/* טופס הוספת תזכורת */}
      <ReminderForm 
        open={reminderFormOpen}
        onClose={handleCloseReminderForm}
        selectedDate={selectedDay}
        onSuccess={refreshReminders}
      />
    </Container>
  );
};

export default HebrewCalendar;