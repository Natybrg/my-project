import React, { useState, useEffect } from 'react';
import { Container, Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import { WbSunny as SunIcon, Opacity as OpacityIcon } from '@mui/icons-material';
import SynagogueMap from '../components/map/SynagogueMap';

const HomePage = () => {
  const [zmanim, setZmanim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [synagogueDetails, setSynagogueDetails] = useState({
    name: "בית הכנסת המרכזי",
    location: {
      lat: "31.7767",
      lng: "35.2345"
    },
    address: "רחוב הדוגמה 123, ירושלים",
    openingHours: "06:00-22:00"
  });

  const handleAddressChange = (newAddress) => {
    setSynagogueDetails(prev => ({
      ...prev,
      address: newAddress,
      name: newAddress // עדכון שם בית הכנסת לפי החיפוש
    }));
  };

  useEffect(() => {
    const fetchZmanim = async () => {
      try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const response = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&latitude=${synagogueDetails.location.lat}&longitude=${synagogueDetails.location.lng}&date=${dateStr}`
        );
        const data = await response.json();
        setZmanim(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching zmanim:', error);
        setLoading(false);
      }
    };

    fetchZmanim();
  }, [synagogueDetails.location]);

  const formatTime = (isoTime) => {
    if (!isoTime) return '';
    const time = new Date(isoTime);
    return time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SynagogueMap
            location={synagogueDetails.location}
            address={synagogueDetails.address}
            openingHours={synagogueDetails.openingHours}
            synagogueName={synagogueDetails.name}
            onAddressChange={handleAddressChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#ffffff',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              זמני היום
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : zmanim ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.soft',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SunIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        זמני תפילה
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      הנץ החמה: {formatTime(zmanim.times.sunrise)}
                    </Typography>
                    <Typography variant="body2">
                      שקיעה: {formatTime(zmanim.times.sunset)}
                    </Typography>
                    <Typography variant="body2">
                      צאת הכוכבים: {formatTime(zmanim.times.tzeit)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.soft',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OpacityIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        זמני מנחה
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      מנחה גדולה: {formatTime(zmanim.times.minchaGedola)}
                    </Typography>
                    <Typography variant="body2">
                      מנחה קטנה: {formatTime(zmanim.times.minchaKetana)}
                    </Typography>
                    <Typography variant="body2">
                      פלג המנחה: {formatTime(zmanim.times.plagHaMincha)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography color="error">
                שגיאה בטעינת הזמנים
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
