import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Divider,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Navigation as NavigationIcon,
  AccessTime as AccessTimeIcon,
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  MyLocation as MyLocationIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const DAYS = [
  { id: 'sunday', name: 'ראשון', color: '#FF9800' },
  { id: 'monday', name: 'שני', color: '#4CAF50' },
  { id: 'tuesday', name: 'שלישי', color: '#2196F3' },
  { id: 'wednesday', name: 'רביעי', color: '#9C27B0' },
  { id: 'thursday', name: 'חמישי', color: '#F44336' },
  { id: 'friday', name: 'שישי', color: '#795548' },
  { id: 'saturday', name: 'שבת', color: '#607D8B' }
];

const SynagogueMap = ({ 
  location = { lat: 31.7767, lng: 35.2345 },
  address = { street: '', number: '', city: '', displayName: '' }, 
  openingHours = {}, 
  synagogueName = '',
  onAddressChange,
  onLocationChange,
  onOpeningHoursChange,
  isAdmin = false 
}) => {
  const theme = useTheme();
  const [navigationMenuAnchor, setNavigationMenuAnchor] = useState(null);
  const [locationDialog, setLocationDialog] = useState(false);
  const [hoursDialog, setHoursDialog] = useState(false);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempHours, setTempHours] = useState(openingHours);
  const [tempAddress, setTempAddress] = useState(address);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayId());
  const [locationError, setLocationError] = useState('');

  function getCurrentDayId() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  // Extract coordinates from Google Maps URL
  const extractCoordinatesFromUrl = (url) => {
    try {
      // Remove @ from the beginning of the URL if it exists
      const cleanUrl = url.startsWith('@') ? url.substring(1) : url;
      
      // If the URL is just coordinates (e.g., "31.7767,35.2345")
      if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(cleanUrl)) {
        const [lat, lng] = cleanUrl.split(',').map(coord => parseFloat(coord.trim()));
        return { lat, lng };
      }

      // Try to extract coordinates from the URL
      const match = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        return { lat, lng };
      }

      throw new Error('לא נמצאו קואורדינטות בקישור. אנא העתק את הקואורדינטות ישירות מהמפה');
    } catch (error) {
      throw new Error('קישור לא תקין. אנא העתק את הקואורדינטות ישירות מהמפה');
    }
  };

  const handleGoogleMapsLinkChange = (event) => {
    const url = event.target.value;
    setLocationError('');
    
    if (!url) return;

    try {
      const coords = extractCoordinatesFromUrl(url);
      setTempLocation(coords);
    } catch (error) {
      setLocationError(error.message);
    }
  };

  // Navigation functions
  const handleNavigationClick = (event) => {
    setNavigationMenuAnchor(event.currentTarget);
  };

  const handleNavigationClose = () => {
    setNavigationMenuAnchor(null);
  };

  const handleNavigate = (mode) => {
    if (!location?.lat || !location?.lng) {
      console.error('Missing location coordinates');
      return;
    }

    let url;
    if (mode === 'waze') {
      url = `https://waze.com/ul?ll=${location.lat},${location.lng}&navigate=yes`;
    } else {
      const baseUrl = 'https://www.google.com/maps/dir/?api=1';
      const destination = `${location.lat},${location.lng}`;
      url = `${baseUrl}&destination=${destination}`;
      if (mode === 'walking') {
        url += '&travelmode=walking';
      } else if (mode === 'driving') {
        url += '&travelmode=driving';
      }
    }

    window.open(url, '_blank');
    handleNavigationClose();
  };

  // Location editing
  const handleLocationDialogOpen = () => {
    setTempLocation(location);
    setTempAddress(address);
    setLocationDialog(true);
  };

  const handleLocationDialogClose = () => {
    setLocationDialog(false);
    setLocationError('');
  };

  const handleLocationSave = () => {
    onLocationChange?.(tempLocation);
    onAddressChange?.(tempAddress);
    setLocationDialog(false);
  };

  // Hours editing
  const handleHoursDialogOpen = () => {
    setTempHours(openingHours);
    setHoursDialog(true);
  };

  const handleHoursDialogClose = () => {
    setHoursDialog(false);
  };

  const handleHoursSave = () => {
    onOpeningHoursChange?.(tempHours);
    setHoursDialog(false);
  };

  const handleHoursChange = (day, field, value) => {
    setTempHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const formatAddress = () => {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number);
    if (address.city) parts.push(address.city);
    return parts.join(' ');
  };

  if (!location?.lat || !location?.lng) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}
      >
        <Typography color="error">
          שגיאה: חסרות נקודות ציון למיקום
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {/* Map Header */}
        <Box 
          sx={{ 
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            <Typography variant="h6" component="div" fontWeight={700}>
              מיקום בית הכנסת
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAdmin && (
              <>
                <Tooltip title="קבע מיקום">
                  <IconButton 
                    size="small"
                    onClick={handleLocationDialogOpen}
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      '&:hover': {
                        bgcolor: theme.palette.grey[200]
                      }
                    }}
                  >
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ערוך שעות פתיחה">
                  <IconButton 
                    size="small"
                    onClick={handleHoursDialogOpen}
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      '&:hover': {
                        bgcolor: theme.palette.grey[200]
                      }
                    }}
                  >
                    <ScheduleIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title="נווט לבית הכנסת">
              <IconButton 
                size="small" 
                onClick={handleNavigationClick}
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                <NavigationIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Location Details */}
        <Box sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body1" fontWeight={500}>
              {formatAddress()}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            שעות פתיחה:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                size="small"
              >
                {DAYS.map((day) => (
                  <MenuItem key={day.id} value={day.id}>
                    יום {day.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box 
              sx={{ 
                p: 2,
                borderRadius: 1,
                bgcolor: `${DAYS.find(d => d.id === selectedDay)?.color}15`,
                border: `1px solid ${DAYS.find(d => d.id === selectedDay)?.color}40`,
                flexGrow: 1
              }}
            >
              <Typography variant="body2" sx={{ color: DAYS.find(d => d.id === selectedDay)?.color, fontWeight: 600, mb: 1 }}>
                {DAYS.find(d => d.id === selectedDay)?.name}
              </Typography>
              <Typography variant="body2">
                {openingHours[selectedDay]?.morning && `בוקר: ${openingHours[selectedDay].morning}`}
                {openingHours[selectedDay]?.evening && ` | ערב: ${openingHours[selectedDay].evening}`}
                {(!openingHours[selectedDay]?.morning && !openingHours[selectedDay]?.evening) && 'לא צוין'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Map Container */}
        <Box 
          sx={{ 
            width: '100%',
            height: '400px',
            position: 'relative',
          }}
        >
          <iframe
            title="synagogue-location"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed&hl=he`}
            allowFullScreen
          />
        </Box>
      </Paper>

      {/* Navigation Menu */}
      <Menu
        anchorEl={navigationMenuAnchor}
        open={Boolean(navigationMenuAnchor)}
        onClose={handleNavigationClose}
      >
        <MenuItem onClick={() => handleNavigate('walking')}>
          <WalkIcon sx={{ mr: 1 }} /> ניווט ברגל
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('waze')}>
          <CarIcon sx={{ mr: 1 }} /> ניווט בוויז
        </MenuItem>
        <MenuItem onClick={() => handleNavigate()}>
          <NavigationIcon sx={{ mr: 1 }} /> כל אפשרויות הניווט
        </MenuItem>
      </Menu>

      {/* Location Dialog */}
      <Dialog open={locationDialog} onClose={handleLocationDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>הגדרת מיקום בית הכנסת</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              שם המיקום
            </Typography>
            <TextField
              label="כינוי למיקום"
              value={tempAddress.displayName || ''}
              onChange={(e) => setTempAddress(prev => ({ ...prev, displayName: e.target.value }))}
              fullWidth
              placeholder="לדוגמה: בית הכנסת המרכזי"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              קואורדינטות מיקום
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                הוראות:
              </Typography>
              <ol style={{ margin: 0, paddingRight: '20px' }}>
                <li>פתח את Google Maps</li>
                <li>חפש את מיקום בית הכנסת</li>
                <li>לחץ על המיקום במפה</li>
                <li>העתק את הקואורדינטות שמופיעות בתחתית המסך</li>
                <li>הדבק כאן בפורמט: 31.7767,35.2345</li>
              </ol>
            </Alert>
            <TextField
              label="הדבק קואורדינטות"
              value={tempAddress.googleMapsUrl || ''}
              onChange={handleGoogleMapsLinkChange}
              fullWidth
              placeholder="לדוגמה: 31.7767,35.2345"
              error={!!locationError}
              helperText={locationError}
            />

            {tempLocation.lat && tempLocation.lng && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  קואורדינטות
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="קו רוחב (Latitude)"
                      type="number"
                      value={tempLocation.lat}
                      onChange={(e) => setTempLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                      inputProps={{ step: 'any' }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="קו אורך (Longitude)"
                      type="number"
                      value={tempLocation.lng}
                      onChange={(e) => setTempLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                      inputProps={{ step: 'any' }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLocationDialogClose}>ביטול</Button>
          <Button 
            onClick={handleLocationSave} 
            variant="contained"
            disabled={!!locationError}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hours Dialog */}
      <Dialog open={hoursDialog} onClose={handleHoursDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>עריכת שעות פתיחה</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {DAYS.map((day) => (
                <Grid item xs={12} key={day.id}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      bgcolor: `${day.color}15`,
                      border: `1px solid ${day.color}40`
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: day.color, fontWeight: 600, mb: 2 }}>
                      יום {day.name}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="שעות בוקר"
                        value={tempHours[day.id]?.morning || ''}
                        onChange={(e) => handleHoursChange(day.id, 'morning', e.target.value)}
                        placeholder="לדוגמה: 06:00-12:00"
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="שעות ערב"
                        value={tempHours[day.id]?.evening || ''}
                        onChange={(e) => handleHoursChange(day.id, 'evening', e.target.value)}
                        placeholder="לדוגמה: 16:00-22:00"
                        fullWidth
                        size="small"
                      />
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHoursDialogClose}>ביטול</Button>
          <Button onClick={handleHoursSave} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SynagogueMap; 