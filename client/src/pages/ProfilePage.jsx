import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Divider, 
  TextField, 
  Button, 
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Person as PersonIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { getUserProfile, updateUserProfile } from '../services/api';

const ProfilePage = (props) => {
  // Accept props with default values
  const defaultProfile = {
    firstName: '',
    lastName: '',
    phone: '',
    fatherName: '',
    password: ''
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // In your useEffect function, update the fetchProfile function to handle network errors better
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('משתמש לא מחובר');
        }
        
        try {
          const response = await getUserProfile(userId);
          const profileData = {
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            phone: response.data.phone || '',
            fatherName: response.data.fatherName || '',
            password: ''
          };
          setProfile(profileData);
          setOriginalProfile(profileData); // Save original data
        } catch (apiError) {
          console.error('API Error:', apiError);
          // If we can't connect to the server, use local storage data if available
          const firstName = localStorage.getItem('firstName') || '';
          setProfile({
            firstName: firstName,
            lastName: '',
            phone: '',
            fatherName: '',
            password: ''
          });
          // Don't show error to user, just log it
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Store original profile data for cancel operation
  const [originalProfile, setOriginalProfile] = useState(defaultProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('משתמש לא מחובר');
        }
        
        try {
          const response = await getUserProfile(userId);
          const profileData = {
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            phone: response.data.phone || '',
            fatherName: response.data.fatherName || '',
            password: ''
          };
          setProfile(profileData);
          setOriginalProfile(profileData); // Save original data
        } catch (apiError) {
          console.error('API Error:', apiError);
          // If we can't connect to the server, use local storage data if available
          const firstName = localStorage.getItem('firstName') || '';
          setProfile({
            firstName: firstName,
            lastName: '',
            phone: '',
            fatherName: '',
            password: ''
          });
          // Don't show error to user, just log it
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (editMode) {
      // When canceling, restore the original profile data
      setProfile({...originalProfile, password: ''});
    } else {
      // When entering edit mode, save current state as original
      setOriginalProfile({...profile});
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('משתמש לא מחובר');
      }
      
      const profileToUpdate = { ...profile };
      if (!profileToUpdate.password) {
        delete profileToUpdate.password; // Don't send empty password
      }
      
      await updateUserProfile(userId, profileToUpdate);
      setSuccess(true);
      setEditMode(false);
      setProfile(prev => ({ ...prev, password: '' })); // Clear password after successful save
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'שגיאה בשמירת הפרופיל');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>טוען פרופיל...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              mr: 2
            }}
          >
            {profile.firstName?.charAt(0) || <PersonIcon fontSize="large" />}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {profile.firstName} {profile.lastName}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "error" : "primary"}
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            sx={{ ml: 2 }}
          >
            {editMode ? 'ביטול' : 'עריכה'}
          </Button>
          {editMode && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
              disabled={saving}
              sx={{ ml: 2 }}
            >
              {saving ? <CircularProgress size={24} /> : 'שמור'}
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  פרטים אישיים
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="שם פרטי"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={!editMode}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="שם משפחה"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={!editMode}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="שם האב"
                    name="fatherName"
                    value={profile.fatherName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  פרטי התקשרות
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="טלפון"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="סיסמה חדשה"
                    name="password"
                    value={profile.password}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={!editMode}
                    type="password"
                    InputLabelProps={{ shrink: true }}
                    helperText={editMode ? "השאר ריק אם אינך רוצה לשנות את הסיסמה" : ""}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar 
        open={!!error || success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || 'הפרופיל עודכן בהצלחה!'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;