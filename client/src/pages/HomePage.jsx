import React, { useState, useEffect } from 'react';
import { Container, Box, Grid, Typography } from '@mui/material';
import { WbSunny as SunIcon, Opacity as OpacityIcon } from '@mui/icons-material';
import SynagogueMap from '../components/map/SynagogueMap';
import SynagogueInfo from '../components/synagogue/SynagogueInfo';
import SynagogueGallery from '../components/gallery/SynagogueGallery';
import RemindersList from '../components/reminders/RemindersList';
import UserDebts from '../components/debts/UserDebts';
import { formatDateKey } from '../components/HebrewCalendar/utils';
import { getRemindersByDateRange } from '../services/reminderService';

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
  const isAdmin = true; // TODO: Get from auth context

  const handleSynagogueDataUpdate = (newData) => {
    setSynagogueData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const handleAddressChange = (newAddress) => {
    setSynagogueData(prev => ({
      ...prev,
      address: newAddress
    }));
  };

  const handleGalleryImagesUpdate = async (newImages) => {
    try {
      // TODO: כאן יש להוסיף קריאת API לעדכון התמונות בשרת
      // const response = await fetch('/api/gallery/images', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newImages)
      // });
      // if (!response.ok) throw new Error('Failed to update gallery images');
      
      setGalleryImages(newImages);
    } catch (error) {
      console.error('Error updating gallery images:', error);
      // TODO: הוסף הודעת שגיאה למשתמש
    }
  };

  const handleGallerySettingsUpdate = async (newSettings) => {
    try {
      // TODO: כאן יש להוסיף קריאת API לעדכון ההגדרות בשרת
      // const response = await fetch('/api/gallery/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });
      // if (!response.ok) throw new Error('Failed to update gallery settings');
      
      setGallerySettings(newSettings);
    } catch (error) {
      console.error('Error updating gallery settings:', error);
      // TODO: הוסף הודעת שגיאה למשתמש
    }
  };

  const handleLocationChange = (newLocation) => {
    setSynagogueLocation(newLocation);
    // TODO: Save to backend
  };

  const handleOpeningHoursChange = (newHours) => {
    setOpeningHours(newHours);
    // TODO: Save to backend
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
            isAdmin={true}
            onSave={handleSynagogueDataUpdate}
          />
        </Box>

        {/* Gallery Section */}
        <Box sx={{ mb: 4, width: '100%' }}>
          <SynagogueGallery 
            images={galleryImages}
            autoPlay={gallerySettings.autoPlay}
            interval={gallerySettings.interval}
            isAdmin={true}
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
    </Box>
  );
};

export default HomePage;
