import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Button, 
  Collapse, 
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon 
} from '@mui/icons-material';
import SynagogueMap from '../components/map/SynagogueMap';
import { getSynagogueLocation } from '../services/synagogueService';

const HomePage = () => {
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [synagogueDetails, setSynagogueDetails] = useState({
    name: "בית הכנסת המרכזי",
    location: {
      lat: "31.7767",
      lng: "35.2345"
    },
    address: "רחוב הדוגמה 123, ירושלים",
    openingHours: {
      sunday: { open: '', close: '' },
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' }
    },
    hideOpeningHours: false
  });

  // Days of the week translations
  const dayTranslations = {
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי',
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת'
  };

  const handleAddressChange = (newAddress) => {
    setSynagogueDetails(prev => ({
      ...prev,
      address: newAddress,
      name: newAddress // עדכון שם בית הכנסת לפי החיפוש
    }));
  };

  useEffect(() => {
    // פונקציה לטעינת פרטי בית הכנסת מהשרת
    const fetchSynagogueDetails = async () => {
      try {
        setLocationLoading(true);
        setLocationError(false);
        const data = await getSynagogueLocation();
        console.log("Synagogue data:", data); // Add debug logging
        
        // Convert opening hours to array if needed
        let formattedOpeningHours = data.openingHours;
        
        // If openingHours is a string, try to create a structured object
        if (typeof data.openingHours === 'string') {
          console.log("Converting openingHours from string format");
          formattedOpeningHours = {
            sunday: { open: '', close: '' },
            monday: { open: '', close: '' },
            tuesday: { open: '', close: '' },
            wednesday: { open: '', close: '' },
            thursday: { open: '', close: '' },
            friday: { open: '', close: '' },
            saturday: { open: '', close: '' }
          };
        }
        
        setSynagogueDetails(prev => ({
          ...prev,
          name: data.name || "בית הכנסת המרכזי",
          location: {
            lat: data.location?.lat || data.latitude || prev.location.lat,
            lng: data.location?.lng || data.longitude || prev.location.lng
          },
          address: data.address || prev.address,
          openingHours: formattedOpeningHours || prev.openingHours,
          hideOpeningHours: data.hideOpeningHours || false
        }));
      } catch (error) {
        console.error('Error fetching synagogue details:', error);
        setLocationError(true);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchSynagogueDetails();
  }, []);

  // Format opening hours for display
  const formatOpeningHoursForDisplay = () => {
    if (typeof synagogueDetails.openingHours === 'string') {
      return synagogueDetails.openingHours;
    }
    
    // Get today's day of week
    const today = new Date();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = daysOfWeek[today.getDay()]; // 0 is Sunday in JS
    
    // Format just today's hours
    const todayHours = synagogueDetails.openingHours[todayName];
    if (todayHours && (todayHours.open || todayHours.close)) {
      const timeStr = todayHours.open && todayHours.close 
        ? `${todayHours.open} - ${todayHours.close}`
        : todayHours.open 
          ? `מ-${todayHours.open}` 
          : todayHours.close 
            ? `עד ${todayHours.close}`
            : '';
      return `יום ${dayTranslations[todayName]}: ${timeStr}`;
    }
    
    return "לא הוגדרו שעות פתיחה להיום";
  };

  // Check if any opening hours are defined
  const hasOpeningHours = Object.values(synagogueDetails.openingHours || {}).some(
    day => day.open || day.close
  );

  // Toggle opening hours display
  const toggleOpeningHours = () => {
    setShowOpeningHours(!showOpeningHours);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 0, sm: 2 } }}>
      <Grid container spacing={0} justifyContent="center">
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            {locationLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : locationError ? (
              <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
                מיקום בית הכנסת לא נקבע
              </Alert>
            ) : (
              <>
                <Box sx={{ 
                  width: '100%', 
                  overflow: 'hidden',
                  borderRadius: { xs: 0, sm: 2 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <SynagogueMap
                    location={synagogueDetails.location}
                    address={synagogueDetails.address}
                    openingHours={formatOpeningHoursForDisplay()}
                    synagogueName={synagogueDetails.name}
                    onAddressChange={handleAddressChange}
                    hideOpeningHours={synagogueDetails.hideOpeningHours}
                    mapHeight={{ xs: '250px', sm: '280px', md: '320px' }}
                    fullWidth={true}
                  />
                </Box>

                {/* Opening Hours Section */}
                {!synagogueDetails.hideOpeningHours && hasOpeningHours && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      mt: 3, 
                      mx: { xs: 2, sm: 2 },
                      p: 2, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                      onClick={toggleOpeningHours}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">שעות פתיחה</Typography>
                      </Box>
                      {showOpeningHours ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    
                    <Collapse in={showOpeningHours}>
                      <Divider sx={{ my: 2 }} />
                      <List dense sx={{ bgcolor: 'background.paper' }}>
                        {Object.entries(synagogueDetails.openingHours || {}).map(([day, hours]) => (
                          (hours.open || hours.close) && (
                            <ListItem key={day} sx={{ py: 0.5 }}>
                              <ListItemText 
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" fontWeight={600}>
                                      יום {dayTranslations[day]}
                                    </Typography>
                                    <Typography variant="body1">
                                      {hours.open && hours.close 
                                        ? `${hours.open} - ${hours.close}`
                                        : hours.open 
                                          ? `מ-${hours.open}` 
                                          : hours.close 
                                            ? `עד ${hours.close}`
                                            : 'לא הוגדר'}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          )
                        ))}
                      </List>
                    </Collapse>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
