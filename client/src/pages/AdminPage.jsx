import React from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

  const adminModules = [
    {
      title: 'ניהול משתמשים',
      description: 'צפייה, עריכה והוספת משתמשים',
      path: '/admin/management' // הנתיב הקיים לדף ניהול המשתמשים
    },
    {
      title: 'ניהול חובות',
      description: 'צפייה ועריכת חובות של משתמשים',
      path: '/admin/debts'
    },
    {
      title: 'ניהול תשלומים',
      description: 'מעקב אחר תשלומים וחובות',
      path: '/admin/payments'
    },
    {
      title: 'הגדרות מערכת',
      description: 'הגדרות כלליות של המערכת',
      path: '/admin/settings'
    },
    {
      title: 'לוח בקרה',
      description: 'סטטיסטיקות ונתונים',
      path: '/admin/dashboard'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          מרכז ניהול
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {adminModules.map((module, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={2}>
                  <CardActionArea onClick={() => navigate(module.path)}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminPage;