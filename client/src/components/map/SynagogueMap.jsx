import React, { useState } from 'react';
import { Box, Paper, Typography, useTheme, Divider, Chip, TextField, IconButton, InputAdornment } from '@mui/material';
import { LocationOn as LocationIcon, AccessTime as TimeIcon, Info as InfoIcon, Search as SearchIcon } from '@mui/icons-material';

const SynagogueMap = ({ location, address, openingHours, synagogueName, onAddressChange }) => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState(address);

  // יצירת כתובת URL למפה עם הכתובת
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?q=${encodedAddress}&zoom=15`;

  const handleSearch = () => {
    if (onAddressChange) {
      onAddressChange(searchValue);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="חפש בית כנסת לפי כתובת או שם"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700}>
              מיקום בית הכנסת
            </Typography>
          </Box>
          <Chip
            icon={<InfoIcon />}
            label={synagogueName}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '300px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <iframe
          title="מפת בית הכנסת"
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            bgcolor: theme.palette.primary.soft,
            borderRadius: 2,
            flex: 1
          }}>
            <Typography variant="body2" fontWeight={600} color="primary">
              כתובת
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {address}
            </Typography>
          </Box>
          <Box sx={{ 
            p: 1.5, 
            bgcolor: theme.palette.primary.soft,
            borderRadius: 2,
            flex: 1
          }}>
            <Typography variant="body2" fontWeight={600} color="primary">
              שעות פתיחה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {openingHours}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default SynagogueMap; 