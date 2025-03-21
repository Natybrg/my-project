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
  Snackbar,
  Fade
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
  Link as LinkIcon,
  Place as PlaceIcon,
  Synagogue as SynagogueIcon
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
  const [mapLoaded, setMapLoaded] = useState(false);

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
          borderRadius: 3,
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[2],
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
          borderRadius: 3,
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[2],
          overflow: 'hidden',
          width: '100%',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
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
            justifyContent: 'space-between',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SynagogueIcon sx={{ fontSize: 28 }} />
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
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
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
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
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
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <NavigationIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Location Details */}
        <Box sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <PlaceIcon color="primary" />
            <Typography variant="body1" fontWeight={500}>
              {formatAddress() || 'כתובת לא הוגדרה'}
            </Typography>
          </Box>
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ ml: 1 }}>
            שעות פתיחה:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl 
              sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white'
                }
              }}
            >
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
                borderRadius: 2,
                bgcolor: `${DAYS.find(d => d.id === selectedDay)?.color}15`,
                border: `1px solid ${DAYS.find(d => d.id === selectedDay)?.color}40`,
                flexGrow: 1,
                transition: 'all 0.3s ease'
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
            overflow: 'hidden'
          }}
        >
          <Fade in={!mapLoaded}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: theme.palette.grey[100],
                zIndex: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">
                טוען מפה...
              </Typography>
            </Box>
          </Fade>
          <iframe
            title="synagogue-location"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed&hl=he&markers=icon:https://maps.google.com/mapfiles/kml/shapes/synagogue.png|${location.lat},${location.lng}`}
            allowFullScreen
            onLoad={() => setMapLoaded(true)}
          />
        </Box>
      </Paper>

      {/* Navigation Menu */}
      <Menu
        anchorEl={navigationMenuAnchor}
        open={Boolean(navigationMenuAnchor)}
        onClose={handleNavigationClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={() => handleNavigate('walking')} sx={{ py: 1.5 }}>
          <WalkIcon sx={{ mr: 1.5 }} /> ניווט ברגל
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('waze')} sx={{ py: 1.5 }}>
          <CarIcon sx={{ mr: 1.5 }} /> ניווט בוויז
        </MenuItem>
        <MenuItem onClick={() => handleNavigate()} sx={{ py: 1.5 }}>
          <NavigationIcon sx={{ mr: 1.5 }} /> כל אפשרויות הניווט
        </MenuItem>
      </Menu>

      {/* Location Dialog */}
      <Dialog 
        open={locationDialog} 
        onClose={handleLocationDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 24,
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MyLocationIcon />
            <Typography variant="h6">הגדרת מיקום בית הכנסת</Typography>
          </Box>
        </DialogTitle>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              קואורדינטות מיקום
            </Typography>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'flex-start',
                  mt: 1
                }
              }}
            >
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: theme.palette.grey[50] }}>
          <Button 
            onClick={handleLocationDialogClose}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleLocationSave} 
            variant="contained"
            disabled={!!locationError}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hours Dialog */}
      <Dialog 
        open={hoursDialog} 
        onClose={handleHoursDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 24,
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            <Typography variant="h6">הגדרת שעות פתיחה</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {DAYS.map((day) => (
              <Box
                key={day.id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: `${day.color}10`,
                  border: `1px solid ${day.color}30`
                }}
              >
                <Typography variant="subtitle1" sx={{ color: day.color, fontWeight: 600, mb: 2 }}>
                  יום {day.name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="שעות בוקר"
                      value={tempHours[day.id]?.morning || ''}
                      onChange={(e) => handleHoursChange(day.id, 'morning', e.target.value)}
                      fullWidth
                      placeholder="לדוגמה: 06:00-12:00"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="שעות ערב"
                      value={tempHours[day.id]?.evening || ''}
                      onChange={(e) => handleHoursChange(day.id, 'evening', e.target.value)}
                      fullWidth
                      placeholder="לדוגמה: 16:00-22:00"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: theme.palette.grey[50] }}>
          <Button 
            onClick={handleHoursDialogClose}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleHoursSave} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SynagogueMap; 