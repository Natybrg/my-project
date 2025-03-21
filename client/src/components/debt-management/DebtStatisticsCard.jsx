import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './DebtStatisticsCard.css';

/**
 * Component to display debt statistics
 * @param {Object} statistics - Debt statistics including totalAmount, paidAmount, unpaidAmount, aliyotCount
 */
const DebtStatisticsCard = ({ statistics }) => {
  if (!statistics) return null;
  
  // Calculate payment percentage
  const paymentPercentage = statistics.totalAmount > 0 
    ? Math.round((statistics.paidAmount / statistics.totalAmount) * 100) 
    : 0;
  
  // Data for pie chart
  const data = [
    { name: 'שולם', value: statistics.paidAmount },
    { name: 'נותר לתשלום', value: statistics.unpaidAmount },
  ];
  
  // Colors for pie chart
  const COLORS = ['#4caf50', '#f44336'];

  return (
    <Card className="statistics-card">
      <CardContent>
        <Typography variant="h5" gutterBottom className="card-title">
          סיכום חובות
        </Typography>
        <Divider className="divider" />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box className="stat-box aliyot-box">
                  <Typography variant="body2" className="stat-label">
                    מספר עליות
                  </Typography>
                  <Typography variant="h5" className="stat-value">
                    {statistics.aliyotCount}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box className="stat-box total-box">
                  <Typography variant="body2" className="stat-label">
                    סך חובות
                  </Typography>
                  <Typography variant="h5" className="stat-value">
                    ₪{statistics.totalAmount}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box className="stat-box paid-box">
                  <Typography variant="body2" className="stat-label">
                    שולם
                  </Typography>
                  <Typography variant="h5" className="stat-value">
                    ₪{statistics.paidAmount}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box className="stat-box unpaid-box">
                  <Typography variant="body2" className="stat-label">
                    נותר לתשלום
                  </Typography>
                  <Typography variant="h5" className="stat-value">
                    ₪{statistics.unpaidAmount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Progress bar */}
            <Box className="progress-container">
              <Box className="progress-header">
                <Typography variant="body2" color="text.secondary">
                  התקדמות תשלומים
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {paymentPercentage}%
                </Typography>
              </Box>
              <Box className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${paymentPercentage}%`,
                    backgroundColor: paymentPercentage < 50 ? '#ff9800' : '#4caf50'
                  }}
                ></div>
              </Box>
            </Box>
          </Grid>
          
          {/* Pie chart */}
          <Grid item xs={12} md={4} className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₪${value}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DebtStatisticsCard;
