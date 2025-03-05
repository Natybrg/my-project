import React from 'react';
import { Card, CardContent, Typography, Grid, Divider, Box } from '@mui/material';

/**
 * Component to display user information
 * @param {Object} userData - The user data to display
 */
const UserInfoCard = ({ userData }) => {
  if (!userData) return null;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          פרטי משתמש
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* שם המשתמש במרכז */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            {userData.firstName} בן {userData.fatherName} {userData.lastName}
          </Typography>
        </Box>
        
        {/* פרטי התקשרות */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} textAlign="center">
            <Typography variant="body1">
              <strong>טלפון:</strong> {userData.phone}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
