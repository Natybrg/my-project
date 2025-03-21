import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Component to display user information in a card format
 * @param {Object} userData - User data including name, email, phone, etc.
 */
const UserInfoCard = ({ userData }) => {
  if (!userData) return null;

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'primary.main',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {userData.name ? userData.name.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
          
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {userData.name || 'משתמש'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {userData.email && (
                <Typography variant="body2" color="text.secondary">
                  {userData.email}
                </Typography>
              )}
              
              {userData.phone && (
                <Typography variant="body2" color="text.secondary">
                  {userData.phone}
                </Typography>
              )}
              
              {userData.role && (
                <Chip 
                  label={userData.role === 'admin' ? 'מנהל' : 'משתמש'} 
                  size="small" 
                  color={userData.role === 'admin' ? 'primary' : 'default'}
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
