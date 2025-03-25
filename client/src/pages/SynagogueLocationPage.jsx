import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  FormGroup,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  IconButton,
  Stack,
  Tooltip,
  Collapse,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  FileCopy as CopyIcon,
  MapOutlined as MapOutlinedIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { 
  getSynagogueLocation, 
  updateSynagogueLocation, 
  getSynagogueData, 
  updateSynagogueData 
} from '../services/synagogueService';
import { useTheme } from '@mui/material/styles';

// Panel interface for TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`synagogue-tabpanel-${index}`}
      aria-labelledby={`synagogue-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

const SynagogueLocationPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    location: { lat: 0, lng: 0 },
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
  
  // Flag to track which API version to use
  const [useV2Api, setUseV2Api] = useState(false);

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

  useEffect(() => {
    fetchSynagogueData();
  }, []);

  const fetchSynagogueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch data from the new API first
      try {
        const data = await getSynagogueData();
        // Convert data to the format expected by the form
        setLocationData({
          name: data.name || '',
          address: data.address || '',
          location: {
            lat: data.latitude || 0,
            lng: data.longitude || 0
          },
          openingHours: data.openingHours || {
            sunday: { open: '', close: '' },
            monday: { open: '', close: '' },
            tuesday: { open: '', close: '' },
            wednesday: { open: '', close: '' },
            thursday: { open: '', close: '' },
            friday: { open: '', close: '' },
            saturday: { open: '', close: '' }
          },
          hideOpeningHours: data.hideOpeningHours || false,
          // Store original data structure for later use
          _originalData: data
        });
        setUseV2Api(true);
        console.log("Successfully fetched data from V2 API");
      } catch (v2Error) {
        console.log("Failed to fetch from V2 API, falling back to legacy API", v2Error);
        // If new API fails, try the legacy API
        const data = await getSynagogueLocation();
        setLocationData(data);
        setUseV2Api(false);
        console.log("Successfully fetched data from legacy API");
      }
    } catch (error) {
      console.error('Error fetching synagogue data:', error);
      setError('אירעה שגיאה בטעינת נתוני בית הכנסת');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleHoursChange = (day, type, value) => {
    setLocationData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [type]: value
        }
      }
    }));
  };

  // Handle setting same hours for all weekdays
  const handleSetWeekdayHours = () => {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const updatedOpeningHours = { ...locationData.openingHours };
    
    weekdays.forEach(day => {
      updatedOpeningHours[day] = { open: '08:00', close: '17:00' };
    });
    
    setLocationData(prev => ({
      ...prev,
      openingHours: updatedOpeningHours
    }));
  };

  // Handle copy hours from one day to another
  const handleCopyHours = (fromDay) => {
    const sourceHours = locationData.openingHours[fromDay];
    
    return (toDay) => {
      if (fromDay === toDay) return;
      
      setLocationData(prev => ({
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [toDay]: { ...sourceHours }
        }
      }));
    };
  };

  const handleToggleChange = (event) => {
    setLocationData(prev => ({
      ...prev,
      hideOpeningHours: event.target.checked
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const toggleAdvancedSettings = () => {
    setShowAdvancedSettings(!showAdvancedSettings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (useV2Api) {
        // Use the new API endpoint
        const updatedData = {
          name: locationData.name,
          address: locationData.address,
          latitude: locationData.location.lat,
          longitude: locationData.location.lng,
          openingHours: locationData.openingHours,
          hideOpeningHours: locationData.hideOpeningHours
        };
        
        await updateSynagogueData(updatedData);
      } else {
        // Use the legacy API endpoint
        await updateSynagogueLocation(locationData);
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error updating synagogue data:', error);
      setError('אירעה שגיאה בשמירת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const clearOpeningHours = () => {
    const emptyHours = {
      sunday: { open: '', close: '' },
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' }
    };
    
    setLocationData(prev => ({
      ...prev,
      openingHours: emptyHours
    }));
  };

  const openGoogleMapsPreview = () => {
    if (locationData.location.lat && locationData.location.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${locationData.location.lat},${locationData.location.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          הנתונים נשמרו בהצלחה!
        </Alert>
      </Snackbar>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#ffffff'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <SettingsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            ניהול מיקום ושעות פתיחה
          </Typography>
        </Box>
        
        {loading && !error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
            <Button color="inherit" size="small" onClick={fetchSynagogueData} sx={{ ml: 2 }}>
              נסה שוב
            </Button>
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                }
              }}
            >
              <Tab 
                icon={<MapOutlinedIcon />} 
                label="פרטי מיקום" 
                iconPosition="start"
              />
              <Tab 
                icon={<ScheduleIcon />} 
                label="שעות פתיחה" 
                iconPosition="start"
              />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="שם בית הכנסת"
                    value={locationData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="הזן את שם בית הכנסת"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="כתובת"
                    value={locationData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    placeholder="הזן את כתובת בית הכנסת"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    cursor: 'pointer'
                  }}
                  onClick={toggleAdvancedSettings}
                  >
                    {showAdvancedSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                      הגדרות מיקום מתקדמות
                    </Typography>
                  </Box>
                  
                  <Collapse in={showAdvancedSettings}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" paragraph>
                        הגדרות אלו משמשות למיקום המדויק על המפה. אם אינך בטוח, השאר את הערכים המקוריים.
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="קו רוחב (Latitude)"
                            type="number"
                            value={locationData.location.lat}
                            onChange={(e) => handleLocationChange('lat', e.target.value)}
                            required
                            inputProps={{ step: 'any' }}
                            placeholder="לדוגמה: 31.7767"
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="קו אורך (Longitude)"
                            type="number"
                            value={locationData.location.lng}
                            onChange={(e) => handleLocationChange('lng', e.target.value)}
                            required
                            inputProps={{ step: 'any' }}
                            placeholder="לדוגמה: 35.2345"
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<MapOutlinedIcon />}
                          onClick={openGoogleMapsPreview}
                          disabled={!locationData.location.lat || !locationData.location.lng}
                        >
                          צפייה במפה
                        </Button>
                      </Box>
                    </Paper>
                  </Collapse>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={locationData.hideOpeningHours}
                        onChange={handleToggleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {locationData.hideOpeningHours ? (
                          <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
                        ) : (
                          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                        )}
                        <Typography>
                          {locationData.hideOpeningHours ? 'הסתר שעות פתיחה בדף הבית' : 'הצג שעות פתיחה בדף הבית'}
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" fontWeight="medium" sx={{ mb: 2 }}>
                    כלים מהירים
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={handleSetWeekdayHours}
                      startIcon={<CopyIcon />}
                    >
                      שעות סטנדרטיות לימי חול
                    </Button>
                    
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="secondary"
                      onClick={clearOpeningHours}
                      startIcon={<DeleteIcon />}
                    >
                      נקה את כל השעות
                    </Button>
                  </Stack>
                </Paper>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium" color="primary">
                  הגדר שעות פתיחה לכל יום
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {Object.entries(locationData.openingHours).map(([day, hours]) => (
                  <Grid item xs={12} key={day} sx={{ mb: 0.5 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 1,
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle2" fontWeight="bold">
                              יום {dayTranslations[day]}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={5} sm={3.5}>
                          <TextField
                            fullWidth
                            label="פתיחה"
                            type="time"
                            value={hours.open || ''}
                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={5} sm={3.5}>
                          <TextField
                            fullWidth
                            label="סגירה"
                            type="time"
                            value={hours.close || ''}
                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Stack direction="row">
                            {(hours.open || hours.close) && (
                              <Tooltip title="העתק שעות ליום אחר">
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      const menu = document.getElementById(`copy-menu-${day}`);
                                      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                    }}
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                  <Box
                                    id={`copy-menu-${day}`}
                                    sx={{
                                      display: 'none',
                                      position: 'absolute',
                                      bgcolor: 'background.paper',
                                      boxShadow: 3,
                                      borderRadius: 1,
                                      p: 1,
                                      zIndex: 1000,
                                      width: '120px',
                                      right: '40px',
                                      marginTop: '4px'
                                    }}
                                  >
                                    <Typography variant="subtitle2" sx={{ mb: 1, px: 1 }}>
                                      העתק ל:
                                    </Typography>
                                    {Object.entries(dayTranslations).map(([dayValue, dayLabel]) => (
                                      dayValue !== day && (
                                        <Button
                                          key={dayValue}
                                          size="small"
                                          fullWidth
                                          variant="text"
                                          sx={{ 
                                            justifyContent: 'flex-start',
                                            minHeight: '30px',
                                            mb: 0.5,
                                            textAlign: 'right'
                                          }}
                                          onClick={() => {
                                            handleCopyHours(day)(dayValue);
                                            document.getElementById(`copy-menu-${day}`).style.display = 'none';
                                          }}
                                        >
                                          יום {dayLabel}
                                        </Button>
                                      )
                                    ))}
                                  </Box>
                                </Box>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="נקה שעות">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  handleHoursChange(day, 'open', '');
                                  handleHoursChange(day, 'close', '');
                                }}
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                {loading ? 'שומר...' : 'שמור שינויים'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SynagogueLocationPage; 