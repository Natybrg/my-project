import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Divider } from '@mui/material';

/**
 * Component to display debt statistics
 * @param {Object} statistics - Debt statistics including totalAmount, paidAmount, unpaidAmount, aliyotCount
 */
const DebtStatisticsCard = ({ statistics }) => {
  if (!statistics) return null;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          סיכום חובות
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                מספר עליות
              </Typography>
              <Typography variant="h6">
                {statistics.aliyotCount}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                סך חובות
              </Typography>
              <Typography variant="h6">
                ₪{statistics.totalAmount}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                שולם
              </Typography>
              <Typography variant="h6" color="success.main">
                ₪{statistics.paidAmount}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                נותר לתשלום
              </Typography>
              <Typography variant="h6" color="error.main">
                ₪{statistics.unpaidAmount}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DebtStatisticsCard;
