import React, { useState, useEffect } from 'react';
import { Container, Box, Grid, Typography, Snackbar, Alert } from '@mui/material';
import { WbSunny as SunIcon, Opacity as OpacityIcon } from '@mui/icons-material';
import SynagogueMap from '../components/map/SynagogueMap';
import SynagogueInfo from '../components/synagogue/SynagogueInfo';
import SynagogueGallery from '../components/gallery/SynagogueGallery';
import RemindersList from '../components/reminders/RemindersList';
import UserDebts from '../components/debts/UserDebts';
import { formatDateKey } from '../components/HebrewCalendar/utils';
import { getRemindersByDateRange } from '../services/reminderService';
import {
  updateSynagogueData,
  updateGalleryImages,
  updateGallerySettings,
  updateSynagogueLocation,
  updateOpeningHours
} from '../services/api';

const HomePage = () => {
  const [synagogueData, setSynagogueData] = useState({
    name: "בית הכנסת המרכזי",
    location: {
      lat: "31.7767",
      lng: "35.2345"
    },
    address: "רחוב הדוגמה 123, ירושלים",
    openingHours: "06:00-22:00",
    description: "בית הכנסת המרכזי שלנו הוא מקום תפילה ולימוד תורה המשרת את הקהילה מזה שנים רבות. אנו מקיימים מניינים קבועים ושיעורי תורה מגוונים.",
    contact: {
      phone: "02-1234567",
      email: "contact@synagogue.com"
    },
    rabbi: "הרב ישראל ישראלי",
    announcements: []
  });

  const [gallerySettings, setGallerySettings] = useState({
    autoPlay: true,
    interval: 5000
  });

  const [galleryImages, setGalleryImages] = useState([
    {
      id: 1,
      url: "https://example.com/image1.jpg",
      caption: "חזית בית הכנסת"
    },
    {
      id: 2,
      url: "https://example.com/image2.jpg",
      caption: "אירוע קהילתי"
    }
  ]);

  const [reminders, setReminders] = useState([]);

  const [synagogueLocation, setSynagogueLocation] = useState({ lat: 31.7767, lng: 35.2345 });
  const [synagogueAddress, setSynagogueAddress] = useState('');
  const [openingHours, setOpeningHours] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check user role when component mounts and on user changes
    const checkUserRole = () => {
      const userRole = localStorage.getItem('userRole');
      // Only admin, manager, and gabai can edit
      setIsAdmin(['admin', 'manager', 'gabai'].includes(userRole));
    };

    checkUserRole();
    window.addEventListener('userChange', checkUserRole);

    return () => {
      window.removeEventListener('userChange', checkUserRole);
    };
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSynagogueDataUpdate = async (newData) => {
    if (!isAdmin) {
      showMessage('אין לך הרשאה לעדכן את פרטי בית הכנסת', 'error');
      return;
    }

    try {
      await updateSynagogueData(newData);
      setSynagogueData(prev => ({
        ...prev,
        ...newData
      }));
      showMessage('פרטי בית הכנסת עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating synagogue data:', error);
      showMessage('אירעה שגיאה בעדכון פרטי בית הכנסת', 'error');
    }
  };

  const handleAddressChange = (newAddress) => {
    setSynagogueData(prev => ({
      ...prev,
      address: newAddress
    }));
  };

  const handleGalleryImagesUpdate = async (newImages) => {
    if (!isAdmin) {
      showMessage('אין לך הרשאה לעדכן את גלריית התמונות', 'error');
      return;
    }

    try {
      await updateGalleryImages(newImages);
      setGalleryImages(newImages);
      showMessage('גלריית התמונות עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating gallery images:', error);
      showMessage('אירעה שגיאה בעדכון גלריית התמונות', 'error');
    }
  };

  const handleGallerySettingsUpdate = async (newSettings) => {
    if (!isAdmin) {
      showMessage('אין לך הרשאה לעדכן את הגדרות הגלריה', 'error');
      return;
    }

    try {
      await updateGallerySettings(newSettings);
      setGallerySettings(newSettings);
      showMessage('הגדרות הגלריה עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating gallery settings:', error);
      showMessage('אירעה שגיאה בעדכון הגדרות הגלריה', 'error');
    }
  };

  const handleLocationChange = async (newLocation) => {
    if (!isAdmin) {
      showMessage('אין לך הרשאה לעדכן את מיקום בית הכנסת', 'error');
      return;
    }

    try {
      await updateSynagogueLocation(newLocation);
      setSynagogueLocation(newLocation);
      showMessage('מיקום בית הכנסת עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating location:', error);
      showMessage('אירעה שגיאה בעדכון מיקום בית הכנסת', 'error');
    }
  };

  const handleOpeningHoursChange = async (newHours) => {
    if (!isAdmin) {
      showMessage('אין לך הרשאה לעדכן את שעות הפתיחה', 'error');
      return;
    }

    try {
      await updateOpeningHours(newHours);
      setOpeningHours(newHours);
      showMessage('שעות הפתיחה עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating opening hours:', error);
      showMessage('אירעה שגיאה בעדכון שעות הפתיחה', 'error');
    }
  };

  // טעינת תזכורות מהשרת
  useEffect(() => {
    const loadDailyReminders = async () => {
      try {
        // יצירת תאריך התחלה (תחילת היום הנוכחי)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // יצירת תאריך סיום (סוף היום הנוכחי)
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        // קבלת התזכורות של היום הנוכחי מהשרת
        const todayReminders = await getRemindersByDateRange(today, endOfDay);
        setReminders(todayReminders);
      } catch (error) {
        console.error('Error loading daily reminders:', error);
        setReminders([]); // במקרה של שגיאה, נציג רשימה ריקה
      }
    };

    loadDailyReminders();

    // הגדרת טיימר לרענון התזכורות כל דקה
    const intervalId = setInterval(loadDailyReminders, 60000);

    // ניקוי הטיימר כשהקומפוננטה מתפרקת
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (isoTime) => {
    if (!isoTime) return '';
    const time = new Date(isoTime);
    return time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Container 
        maxWidth={false} 
        disableGutters 
        sx={{ 
          width: '100%',
          px: { xs: 2, lg: 4 } // padding בצדדים שמשתנה בהתאם לגודל המסך
        }}
      >
        {/* Main Info Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
            {synagogueData.name}
          </Typography>
          <SynagogueInfo 
            synagogueData={synagogueData}
            isAdmin={isAdmin}
            onSave={handleSynagogueDataUpdate}
          />
        </Box>

        {/* Gallery Section */}
        <Box sx={{ mb: 4, width: '100%' }}>
          <SynagogueGallery 
            images={galleryImages}
            autoPlay={gallerySettings.autoPlay}
            interval={gallerySettings.interval}
            isAdmin={isAdmin}
            onImagesUpdate={handleGalleryImagesUpdate}
            onSettingsUpdate={handleGallerySettingsUpdate}
          />
        </Box>

        {/* Reminders and Debts - Equal Height */}
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mb: 4,
            width: '100%',
            mx: 0
          }}
        >
          <Grid item xs={12} md={6} sx={{ width: '100%' }}>
            <Box sx={{ 
              width: '100%',
              display: 'flex'
            }}>
              <RemindersList reminders={reminders} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: '100%' }}>
            <Box sx={{ 
              width: '100%',
              display: 'flex'
            }}>
              <UserDebts />
            </Box>
          </Grid>
        </Grid>

        {/* Map Section - Full Width */}
        <Box sx={{ 
          mb: 4, 
          width: '100%',
          '& > *': { // מתייחס לכל האלמנטים הישירים בתוך הקופסה
            width: '100% !important', // מכריח את כל האלמנטים להיות ברוחב מלא
            maxWidth: 'none !important'
          }
        }}>
          <SynagogueMap
            location={synagogueLocation}
            address={synagogueAddress}
            openingHours={openingHours}
            onLocationChange={handleLocationChange}
            onOpeningHoursChange={handleOpeningHoursChange}
            isAdmin={isAdmin}
          />
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: 3,
          mt: 4,
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="div" gutterBottom>
                {synagogueData.name}
              </Typography>
              <Typography variant="body2" component="div">
                {synagogueData.address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="div" gutterBottom>
                שעות פעילות
              </Typography>
              <Typography variant="body2" component="div">
                {synagogueData.openingHours}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="div" gutterBottom>
                צור קשר
              </Typography>
              <Typography variant="body2" component="div">
                טלפון: {synagogueData.contact?.phone}
              </Typography>
              <Typography variant="body2" component="div">
                דוא״ל: {synagogueData.contact?.email}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;
