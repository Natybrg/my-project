import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  Divider, 
  Chip, 
  Alert, 
  CircularProgress,
  Button,
  Tooltip,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  useMediaQuery
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon, 
  Info as InfoIcon, 
  DirectionsWalk as WalkIcon,
  DirectionsCar as DriveIcon,
  Map as MapIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';
import { getSynagogueLocation, getNavigationLinks } from '../../services/synagogueService';

const SynagogueMap = ({ location, address, openingHours, synagogueName, onAddressChange, hideOpeningHours }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapLocation, setMapLocation] = useState(location);
  const [navigationLinks, setNavigationLinks] = useState(null);

  // Fetch synagogue coordinates on component mount
  useEffect(() => {
    const fetchSynagogueCoordinates = async () => {
      // Skip fetch if valid coordinates are already provided
      if (location && location.lat && location.lng) {
        setMapLocation({
          lat: location.lat,
          lng: location.lng
        });
        setNavigationLinks(getNavigationLinks(location.lat, location.lng));
        return;
      }

      try {
        setMapLoading(true);
        setMapError(false);
        const data = await getSynagogueLocation();
        
        if (data.location?.lat && data.location?.lng) {
          setMapLocation({
            lat: data.location.lat,
            lng: data.location.lng
          });
          setNavigationLinks(getNavigationLinks(data.location.lat, data.location.lng));
        } else if (data.latitude && data.longitude) {
          setMapLocation({
            lat: data.latitude,
            lng: data.longitude
          });
          setNavigationLinks(getNavigationLinks(data.latitude, data.longitude));
        } else {
          setMapError(true);
        }
      } catch (error) {
        console.error('Error fetching synagogue coordinates:', error);
        setMapError(true);
      } finally {
        setMapLoading(false);
      }
    };

    fetchSynagogueCoordinates();
  }, [location]);

  // יצירת כתובת URL למפה עם הקואורדינטות או הכתובת
  const getMapUrl = () => {
    if (mapLocation?.lat && mapLocation?.lng) {
      return `https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    const encodedAddress = encodeURIComponent(address || '');
    return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  // Navigation actions for SpeedDial
  const navigationActions = [
    { 
      icon: <WalkIcon />, 
      name: 'הליכה', 
      tooltip: 'הגעה ברגל (Google Maps)', 
      action: () => navigationLinks?.googleMapsWalking && window.open(navigationLinks.googleMapsWalking, '_blank')
    },
    { 
      icon: <DriveIcon />, 
      name: 'נסיעה', 
      tooltip: 'הגעה ברכב (Waze)', 
      action: () => navigationLinks?.waze && window.open(navigationLinks.waze, '_blank')
    },
    { 
      icon: <MapIcon />, 
      name: 'כללי', 
      tooltip: 'הוראות הגעה (Google Maps)', 
      action: () => navigationLinks?.googleMaps && window.open(navigationLinks.googleMaps, '_blank')
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            width: isMobile ? '100%' : 'auto'
          }}>
            <LocationIcon 
              sx={{ 
                color: theme.palette.primary.main, 
                fontSize: { xs: 28, md: 32 }
              }} 
            />
            <Typography 
              variant="h5" 
              fontWeight={700}
              color="text.primary"
            >
              מיקום בית הכנסת
            </Typography>
          </Box>
          <Chip
            icon={<InfoIcon />}
            label={synagogueName}
            variant="outlined"
            size={isMobile ? "medium" : "small"}
            sx={{ 
              borderRadius: 2,
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              '& .MuiChip-icon': {
                color: theme.palette.primary.contrastText
              },
              px: 1
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: { xs: '300px', sm: '350px', md: '400px' },
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          mb: 3
        }}
      >
        {mapLoading ? (
          <CircularProgress color="primary" size={60} />
        ) : mapError ? (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              textAlign: 'center',
              fontSize: '1.1rem',
              py: 2
            }}
          >
            מיקום בית הכנסת לא הוגדר
          </Alert>
        ) : (
          <iframe
            title="מפת בית הכנסת"
            width="100%"
            height="100%"
            frameBorder="0"
            src={getMapUrl()}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        )}

        {/* Navigation Floating Menu */}
        {!mapLoading && !mapError && navigationLinks && (
          <SpeedDial
            ariaLabel="אפשרויות ניווט"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              '& .MuiSpeedDial-fab': {
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 }
              },
              zIndex: 2
            }}
            icon={<SpeedDialIcon icon={<NavigationIcon />} />}
            direction="up"
          >
            {navigationActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.tooltip}
                onClick={action.action}
                tooltipOpen={!isMobile}
                FabProps={{
                  disabled: !navigationLinks,
                  sx: {
                    bgcolor: theme.palette.background.paper,
                    '&:hover': {
                      bgcolor: theme.palette.primary.light,
                    }
                  }
                }}
              />
            ))}
          </SpeedDial>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'stretch', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.primary.soft || 'rgba(25, 118, 210, 0.08)',
            borderRadius: 2,
            flex: hideOpeningHours ? 1 : 0.5,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
              כתובת
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {address}
            </Typography>
          </Box>
          
          {!hideOpeningHours && openingHours && (
            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.primary.soft || 'rgba(25, 118, 210, 0.08)',
              borderRadius: 2,
              flex: 0.5,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
                שעות פתיחה
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {openingHours}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default SynagogueMap; 