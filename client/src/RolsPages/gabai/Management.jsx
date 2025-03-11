import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Chip,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Edit as EditIcon, Add as AddIcon, Person as PersonIcon, Search as SearchIcon, Delete as DeleteIcon, Close as CloseIcon 
} from '@mui/icons-material';
import { getAllUsers, updateUser, createAliya, deleteUser } from '../../services/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import heLocale from 'date-fns/locale/he';

const Management = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isAddingAliya, setIsAddingAliya] = useState(false);
  const [newAliya, setNewAliya] = useState({ amount: '', parsha: '', aliyaType: '' });
  const [addAliyaLoading, setAddAliyaLoading] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false); // Correctly initialize with set function
  const [newDebt, setNewDebt] = useState({
    amount: '',
    parsha: '',
    aliyaType: 'אחר',
    date: new Date(),
  });

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'admin': return 'מנהל';
      case 'gabai': return 'גבאי';
      case 'manager': return 'מנג\'ר';
      case 'user': return 'משתמש רגיל';
      default: return role || 'לא מוגדר';
    }
  };

  const filteredUsers = users ? users.filter(user => {
    const matchesPhone = searchPhone === '' || 
      (user.phone && user.phone.includes(searchPhone));
    
    const matchesRole = searchRole === '' || user.rols === searchRole;
    
    return matchesPhone && matchesRole;
  }) : [];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers();
        const userData = response.data ? response.data : response;
        console.log('User data received:', userData);
        setUsers(userData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'אירעה שגיאה בטעינת המשתמשים');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsAddingAliya(false);
  };

  const handleEdit = () => {
    setEditedUser({ ...selectedUser });
    setIsEditing(true);
    setIsAddingAliya(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAliyaInputChange = (e) => {
    const { name, value } = e.target;
    setNewAliya(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      await updateUser(selectedUser._id, editedUser);
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, ...editedUser } : user
      ));
      setSelectedUser({ ...selectedUser, ...editedUser });
      setIsEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddAliya = async () => {
    setAddAliyaLoading(true);
    try {
      await createAliya(selectedUser._id, {
        amount: newAliya.amount,
        parsha: newAliya.parsha,
        aliyaType: newAliya.aliyaType
      });
      setNewAliya({ amount: '', parsha: '', aliyaType: '' });
      setIsAddingAliya(false);
      // Refresh user data after adding Aliyah
      const response = await getAllUsers();
      const userData = response.data ? response.data : response;
      setUsers(userData);
    } catch (err) {
      console.error('Error adding aliya:', err);
      setError(err.message || 'Error adding aliya');
    } finally {
      setAddAliyaLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      // Assuming you have a way to get the current user's role
      const currentUserRole = 'admin'; // Replace this with the actual logic to get the current user's role
      
      if (selectedUser.rols === 'admin' && currentUserRole === 'admin') {
        setError('Admin cannot delete another admin.');
        return;
      }

      console.log(`Attempting to delete user with ID: ${selectedUser._id}`);
      await deleteUser(selectedUser._id);
      // Re-fetch users to update the UI
      const response = await getAllUsers();
      const userData = response.data ? response.data : response;
      setUsers(userData);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Error deleting user');
    }
  };

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    try {
      // Assuming you have a way to get the current user's role
      const currentUserRole = 'admin'; // Replace this with the actual logic to get the current user's role
      
      if (selectedUser.rols === 'admin' && currentUserRole === 'admin') {
        setError('Admin cannot change the role of another admin.');
        return;
      }

      await updateUser(selectedUser._id, { rols: newRole });
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, rols: newRole } : user
      ));
      setSelectedUser({ ...selectedUser, rols: newRole });
    } catch (err) {
      setError(err.message || 'Error updating user role');
    }
  };

  // Add these missing functions
  const handleDebtInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewDebt(prev => ({ ...prev, date }));
  };

  const handleAddDebt = () => {
    setIsAddingDebt(true); // Ensure this function updates the state
  };

  const handleSaveDebt = async () => {
    setAddAliyaLoading(true);
    try {
      // Validate required fields
      if (!newDebt.amount || !newDebt.parsha || !newDebt.aliyaType || !newDebt.date) {
        setError('Missing required fields');
        setAddAliyaLoading(false);
        return;
      }

      // Ensure the fields match what the server expects
      const debtData = {
        amount: Number(newDebt.amount), // Ensure amount is a number
        parsha: newDebt.parsha.trim(), // Trim whitespace
        aliyaType: newDebt.aliyaType,
        date: newDebt.date instanceof Date ? newDebt.date.toISOString() : newDebt.date, // Safely convert date
      };

      console.log('Sending debt data:', debtData); // Log the data being sent
      
      // Pass userId separately as the first parameter
      await createAliya(selectedUser._id, debtData);
      
      // Reset form and state after successful submission
      setNewDebt({
        amount: '',
        parsha: '',
        aliyaType: 'אחר',
        date: new Date(),
      });
      setIsAddingDebt(false);
      
      // Refresh user data after adding Aliyah
      const response = await getAllUsers();
      const userData = response.data ? response.data : response;
      setUsers(userData);
    } catch (err) {
      console.error('Error adding debt:', err);
      setError(err.message || 'Error adding debt');
    } finally {
      setAddAliyaLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 3, 
      p: 3,
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Card 
        elevation={3} 
        sx={{ 
          width: { xs: '100%', md: '45%' }, 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 8 // Increased shadow on hover
          }
        }}
      >
        <CardHeader
          title={
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              רשימת משתמשים
            </Typography>
          }
          sx={{ 
            bgcolor: 'background.paper', 
            borderBottom: 1, 
            borderColor: 'divider',
            pb: 1
          }}
        />
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: 'center', 
            gap: 2, 
            mb: 2 
          }}>
            <TextField
              label="חפש לפי מספר טלפון"
              variant="outlined"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="search-role-label">תפקיד</InputLabel>
              <Select
                labelId="search-role-label"
                id="search-role-select"
                value={searchRole}
                label="תפקיד"
                onChange={(e) => setSearchRole(e.target.value)}
              >
                <MenuItem value="">כל התפקידים</MenuItem>
                <MenuItem value="admin">מנהל</MenuItem>
                <MenuItem value="gabai">גבאי</MenuItem>
                <MenuItem value="manager">מנג'ר</MenuItem>
                <MenuItem value="user">משתמש רגיל</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>
          ) : filteredUsers.length > 0 ? (
            <List 
              sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
              }}
            >
              {filteredUsers.map((user) => (
                <React.Fragment key={user._id}>
                  <ListItem 
                    onClick={() => handleUserClick(user)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(-4px)'
                      },
                      ...(selectedUser && selectedUser._id === user._id ? {
                        bgcolor: 'primary.light',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        }
                      } : {})
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: user.rols === 'admin' ? 'error.main' : 
                                user.rols === 'gabai' ? 'success.main' : 
                                user.rols === 'manager' ? 'info.main' : 'primary.main',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      {user.firstName?.charAt(0) || <PersonIcon />}
                    </Avatar>
                    <ListItemText 
                      primary={
                        <Typography component="div" fontWeight="medium">
                          {`${user.firstName || ''} ${user.lastName || ''}`}
                        </Typography>
                      } 
                      secondary={
                        <Typography component="div" variant="body2">
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={getRoleDisplayName(user.rols)}
                              size="small"
                              sx={{ 
                                bgcolor: user.rols === 'admin' ? 'error.light' : 
                                        user.rols === 'gabai' ? 'success.light' : 
                                        user.rols === 'manager' ? 'info.light' : 'primary.light',
                                color: user.rols === 'admin' ? 'error.dark' : 
                                      user.rols === 'gabai' ? 'success.dark' : 
                                      user.rols === 'manager' ? 'info.dark' : 'primary.dark',
                                fontWeight: 'medium'
                              }}
                            />
                          </Box>
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>אין משתמשים להצגה.</Alert>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}>
            <Typography variant="body2" fontWeight="medium">
              סה"כ המשתמשים: {filteredUsers.length}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card 
          elevation={3} 
          sx={{ 
            width: { xs: '100%', md: '45%' }, 
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 8 // Increased shadow on hover
            }
          }}
        >
          <CardHeader
            title={
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
            }
            subheader={
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={getRoleDisplayName(selectedUser.rols)}
                  size="small"
                  sx={{ 
                    bgcolor: selectedUser.rols === 'admin' ? 'error.light' : 
                            selectedUser.rols === 'gabai' ? 'success.light' : 
                            selectedUser.rols === 'manager' ? 'info.light' : 'primary.light',
                    color: selectedUser.rols === 'admin' ? 'error.dark' : 
                          selectedUser.rols === 'gabai' ? 'success.dark' : 
                          selectedUser.rols === 'manager' ? 'info.dark' : 'primary.dark',
                    fontWeight: 'medium'
                  }}
                />
              </Box>
            }
            action={
              !isEditing && !isAddingAliya && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    color="primary" 
                    onClick={handleEdit}
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        bgcolor: 'primary.light'
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="success" 
                    onClick={handleAddDebt}
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        bgcolor: 'success.light'
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                  {selectedUser.rols !== 'admin' && (
                    <IconButton 
                      color="error" 
                      onClick={handleDeleteUser}
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          bgcolor: 'error.light'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              )
            }
            sx={{ 
              bgcolor: 'background.paper', 
              borderBottom: 1, 
              borderColor: 'divider',
              pb: 1
            }}
          />
          <CardContent sx={{ p: 2 }}>
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                  label="שם פרטי" 
                  name="firstName" 
                  value={editedUser.firstName || ''} 
                  onChange={handleInputChange} 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  label="שם משפחה" 
                  name="lastName" 
                  value={editedUser.lastName || ''} 
                  onChange={handleInputChange} 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  label="טלפון" 
                  name="phone" 
                  value={editedUser.phone || ''} 
                  onChange={handleInputChange} 
                  fullWidth 
                  variant="outlined"
                />
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">תפקיד</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    name="rols"
                    value={editedUser.rols || ''}
                    label="תפקיד"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="admin">מנהל</MenuItem>
                    <MenuItem value="gabai">גבאי</MenuItem>
                    <MenuItem value="manager">מנג'ר</MenuItem>
                    <MenuItem value="user">משתמש רגיל</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdate}
                    disabled={updateLoading}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {updateLoading ? <CircularProgress size={24} /> : 'עדכן'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    sx={{
                      px: 3,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    ביטול
                  </Button>
                </Box>
              </Box>
            ) : isAddingAliya ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                  label="סכום" 
                  name="amount" 
                  value={newAliya.amount} 
                  onChange={handleAliyaInputChange} 
                  fullWidth 
                  variant="outlined"
                  type="number"
                />
                <TextField 
                  label="פרשה" 
                  name="parsha" 
                  value={newAliya.parsha} 
                  onChange={handleAliyaInputChange} 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  label="סוג עלייה" 
                  name="aliyaType" 
                  value={newAliya.aliyaType}
                  onChange={handleAliyaInputChange}
                  fullWidth
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAddAliya}
                    disabled={addAliyaLoading}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {addAliyaLoading ? <CircularProgress size={24} /> : 'הוסף עלייה'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsAddingAliya(false)}
                    sx={{
                      px: 3,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    ביטול
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" fontWeight="medium" color="primary.main" gutterBottom>
                  פרטים אישיים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  שם פרטי: {selectedUser.firstName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  שם משפחה: {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  שם אב: {selectedUser.fatherName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  טלפון: {selectedUser.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  תפקיד: {getRoleDisplayName(selectedUser.rols)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add New Debt Dialog */}
      <Dialog 
        open={isAddingDebt} 
        onClose={() => setIsAddingDebt(false)}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1
        }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            הוספת חוב חדש
          </Typography>
          <IconButton onClick={() => setIsAddingDebt(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="סכום"
              name="amount"
              value={newDebt.amount}
              onChange={handleDebtInputChange}
              fullWidth
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₪</Typography>,
              }}
            />
            
            <TextField
              label="פרשה"
              name="parsha"
              value={newDebt.parsha}
              onChange={handleDebtInputChange}
              fullWidth
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel id="aliya-type-label">סוג עלייה</InputLabel>
              <Select
                labelId="aliya-type-label"
                id="aliya-type-select"
                name="aliyaType"
                value={newDebt.aliyaType}
                label="סוג עלייה"
                onChange={handleDebtInputChange}
              >
                <MenuItem value="אחר">אחר</MenuItem>
                <MenuItem value="כהן">כהן</MenuItem>
                <MenuItem value="לוי">לוי</MenuItem>
                <MenuItem value="שלישי">שלישי</MenuItem>
                <MenuItem value="רביעי">רביעי</MenuItem>
                <MenuItem value="חמישי">חמישי</MenuItem>
                <MenuItem value="שישי">שישי</MenuItem>
                <MenuItem value="שביעי">שביעי</MenuItem>
                <MenuItem value="מפטיר">מפטיר</MenuItem>
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
              <DatePicker
                label="תאריך"
                value={newDebt.date}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            variant="outlined" 
            onClick={() => setIsAddingDebt(false)}
            sx={{ borderRadius: 2 }}
          >
            ביטול
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveDebt}
            disabled={addAliyaLoading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark',
              }
            }}
          >
            {addAliyaLoading ? <CircularProgress size={24} /> : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Management;