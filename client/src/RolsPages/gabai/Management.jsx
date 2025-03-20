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
  Edit as EditIcon, Add as AddIcon, Person as PersonIcon, Search as SearchIcon, Delete as DeleteIcon, Close as CloseIcon, MonetizationOn as MonetizationOnIcon 
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
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [newDebt, setNewDebt] = useState({
    amount: '',
    parsha: '',
    aliyaType: 'אחר',
    date: new Date(),
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    // Basic filters that apply to all roles
    const matchesPhone = searchPhone === '' || 
      (user.phone && user.phone.includes(searchPhone));
    
    const matchesRole = searchRole === '' || user.rols === searchRole;

    // Manager and Admin can see all users
    if (currentUserRole === 'manager' || currentUserRole === 'admin') {
      return matchesPhone && matchesRole;
    }

    // Gabai can see all users except admin
    if (currentUserRole === 'gabai') {
      return matchesPhone && matchesRole && user.rols !== 'admin';
    }

    // Regular users can't see any users
    return false;
  }) : [];

  // Update search role options based on user role
  const getRoleSearchOptions = () => {
    // Admin and Manager can see and search all roles
    if (currentUserRole === 'admin' || currentUserRole === 'manager') {
      return [
        <MenuItem key="all" value="">כל התפקידים</MenuItem>,
        <MenuItem key="admin" value="admin">מנהל</MenuItem>,
        <MenuItem key="manager" value="manager">מנג'ר</MenuItem>,
        <MenuItem key="gabai" value="gabai">גבאי</MenuItem>,
        <MenuItem key="user" value="user">משתמש רגיל</MenuItem>
      ];
    }
    // Gabai can see all roles except admin
    if (currentUserRole === 'gabai') {
      return [
        <MenuItem key="all" value="">כל התפקידים</MenuItem>,
        <MenuItem key="manager" value="manager">מנג'ר</MenuItem>,
        <MenuItem key="gabai" value="gabai">גבאי</MenuItem>,
        <MenuItem key="user" value="user">משתמש רגיל</MenuItem>
      ];
    }
    return [];
  };

  useEffect(() => {
    // Get current user role from localStorage
    const roleFromAuth = localStorage.getItem('role');
    const roleFromUser = localStorage.getItem('userRole');
    const userRole = roleFromAuth || roleFromUser;
    
    console.log('Current role:', userRole); // Debug log
    
    setCurrentUserRole(userRole);
    
    // Always fetch users for admin, manager, and gabai roles
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'gabai') {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const userData = response.data ? response.data : response;
      console.log('Fetched users:', userData); // Debug log
      setUsers(userData);
    } catch (err) {
      setError(err.message || 'אירעה שגיאה בטעינת המשתמשים');
    } finally {
      setLoading(false);
    }
  };

  // If user is not admin, manager, or gabai, show error message
  if (!currentUserRole || (currentUserRole !== 'admin' && currentUserRole !== 'manager' && currentUserRole !== 'gabai')) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        p: 3
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 400,
            width: '100%',
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          אין לך הרשאה לצפות בדף זה. רק מנהלים, מנג'רים וגבאים יכולים לגשת לדף זה.
        </Alert>
      </Box>
    );
  }

  const refreshUsers = async () => {
    try {
      const response = await getAllUsers();
      const userData = response.data ? response.data : response;
      setUsers(userData);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError(err.message || 'אירעה שגיאה בטעינת המשתמשים');
    }
  };

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
      setError(null); // Clear any existing errors
    } catch (err) {
      console.error('Error updating user:', err);
      if (err.response?.status === 403) {
        setError('אין לך הרשאה לעדכן משתמש זה');
      } else {
        setError(err.message || 'אירעה שגיאה בעדכון המשתמש');
      }
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
      await refreshUsers();
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
      await refreshUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Error deleting user');
    }
  };

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    try {
      if (selectedUser.rols === 'admin') {
        setError('לא ניתן לשנות תפקיד של מנהל');
        return;
      }

      await updateUser(selectedUser._id, { rols: newRole });
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, rols: newRole } : user
      ));
      setSelectedUser({ ...selectedUser, rols: newRole });
      setError(null); // Clear any existing errors
    } catch (err) {
      console.error('Error updating user role:', err);
      if (err.response?.status === 403) {
        setError('אין לך הרשאה לשנות תפקיד משתמש');
      } else {
        setError(err.message || 'אירעה שגיאה בעדכון תפקיד המשתמש');
      }
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
      await refreshUsers();
    } catch (err) {
      console.error('Error adding debt:', err);
      setError(err.message || 'Error adding debt');
    } finally {
      setAddAliyaLoading(false);
    }
  };

  const canEditUser = (userToEdit) => {
    // Admin can edit all users
    if (currentUserRole === 'admin') {
      return true;
    }
    // Manager can edit gabai and regular users
    if (currentUserRole === 'manager') {
      return userToEdit.rols === 'gabai' || userToEdit.rols === 'user';
    }
    // Gabai can only edit regular users
    if (currentUserRole === 'gabai') {
      return userToEdit.rols === 'user';
    }
    // Other roles cannot edit users
    return false;
  };

  const canEditRole = (userToEdit) => {
    // Admin can edit all roles except admin (including their own)
    if (currentUserRole === 'admin') {
      return userToEdit.rols !== 'admin';
    }
    // Manager can only edit gabai roles and regular users
    if (currentUserRole === 'manager') {
      return userToEdit.rols === 'gabai' || userToEdit.rols === 'user';
    }
    // Gabai can only edit regular users
    if (currentUserRole === 'gabai') {
      return userToEdit.rols === 'user';
    }
    // Other roles cannot edit roles
    return false;
  };

  // Update the Select component to show relevant options based on user role
  const getRoleOptions = () => {
    if (currentUserRole === 'admin') {
      return [
        <MenuItem key="gabai" value="gabai">גבאי</MenuItem>,
        <MenuItem key="manager" value="manager">מנג'ר</MenuItem>,
        <MenuItem key="user" value="user">משתמש רגיל</MenuItem>
      ];
    }
    if (currentUserRole === 'manager') {
      return [
        <MenuItem key="gabai" value="gabai">גבאי</MenuItem>,
        <MenuItem key="user" value="user">משתמש רגיל</MenuItem>
      ];
    }
    if (currentUserRole === 'gabai') {
      return [
        <MenuItem key="user" value="user">משתמש רגיל</MenuItem>
      ];
    }
    return [];
  };

  // Function to handle delete button click
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const confirmDelete = () => {
    // Add your delete logic here
    setIsDeleteDialogOpen(false);
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ 
      p: 1,
      height: '100vh',
      maxWidth: '100%',
      background: 'linear-gradient(135deg, #f5f9ff 0%, #ffffff 100%)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }} dir="rtl">
      <Typography 
        variant="h5" 
        sx={{
          fontWeight: 800,
          color: '#2c3e50',
          mb: 1,
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          letterSpacing: '0.5px'
        }}
      >
        {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'משתמש'}
      </Typography>

      {/* Search Controls */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1.5, 
        mb: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        '& .MuiTextField-root, & .MuiFormControl-root': {
          background: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          },
          '& .MuiInputBase-root': {
            height: '45px',
            fontSize: '1rem',
            '& input': {
              padding: '12px 16px'
            }
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.95rem',
            color: '#34495e',
            transform: 'translate(14px, 12px) scale(1)'
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -8px) scale(0.75)'
          }
        }
      }}>
        <TextField
          label="חיפוש לפי טלפון"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          variant="outlined"
          size="medium"
          sx={{ 
            width: 200,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
                borderWidth: '2px'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: '2px'
              }
            }
          }}
        />
        
        <FormControl sx={{ width: 200 }}>
          <InputLabel>סינון לפי תפקיד</InputLabel>
          <Select
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            label="סינון לפי תפקיד"
            size="medium"
            sx={{
              '& .MuiSelect-select': {
                padding: '8px 12px',
                fontSize: '0.9rem'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '2px'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '2px'
              }
            }}
          >
            {getRoleSearchOptions()}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 1,
            borderRadius: 2,
            py: 1,
            backgroundColor: '#fff5f5',
            color: '#e53e3e',
            border: '1px solid #fed7d7',
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
              fontWeight: 500
            },
            boxShadow: '0 2px 4px rgba(229, 62, 62, 0.1)'
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2, 
        p: 1,
        maxWidth: '100%',
        overflow: 'hidden',
        flex: 1
      }}>
        <Card 
          elevation={0}
          sx={{ 
            width: { xs: '100%', md: '50%' },
            borderRadius: 3,
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 150px)',
            minHeight: '600px',
            '&:hover': {
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            }
          }}
        >
          <CardHeader
            title={
              <Typography 
                variant="h6" 
                fontWeight="700" 
                color="#2c3e50"
                sx={{ fontSize: '1.1rem' }}
              >
                רשימת משתמשים
              </Typography>
            }
            sx={{ 
              bgcolor: '#f8fafc', 
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              p: 2,
              '& .MuiCardHeader-content': {
                overflow: 'hidden'
              }
            }}
          />
          <CardContent sx={{ 
            p: 1, 
            overflow: 'hidden', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%'
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 0.25 }}>
                <CircularProgress size={16} />
              </Box>
            ) : filteredUsers.length > 0 ? (
              <List 
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  borderRadius: 1,
                  border: '1px solid rgba(0,0,0,0.1)',
                  bgcolor: '#fff',
                  p: 0.25,
                  '& .MuiListItem-root': {
                    py: 0.25
                  },
                  '&::-webkit-scrollbar': {
                    width: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '1.5px',
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
                        borderRadius: 1,
                        my: 2,
                        mx: 2,
                        py: 2,
                        px: 2.5,
                        minHeight: '70px',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(-2px)'
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
                          mr: 2.5, 
                          width: 50,
                          height: 50,
                          fontSize: '1.6rem'
                        }}
                      >
                        {user.firstName?.charAt(0) || <PersonIcon sx={{ fontSize: '1.6rem' }} />}
                      </Avatar>
                      <ListItemText 
                        primary={`${user.firstName || ''} ${user.lastName || ''}`}
                        secondary={
                          <Typography 
                            component="div" 
                            variant="body2"
                            sx={{ 
                              mt: 1, 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: 1.5,
                              flexWrap: 'wrap'
                            }}
                          >
                            <Chip
                              label={getRoleDisplayName(user.rols)}
                              size="medium"
                              sx={{ 
                                height: 20,
                                fontSize: '0.8rem',
                                '& .MuiChip-label': {
                                  px: 1,
                                  py: 0
                                },
                                color: '#ffffff',
                                bgcolor: user.rols === 'admin' ? 'error.dark' : 
                                      user.rols === 'gabai' ? 'success.dark' : 
                                      user.rols === 'manager' ? 'info.dark' : 'primary.dark',
                                fontWeight: 'medium'
                              }}
                            />
                            <Typography 
                              component="span" 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.875rem',
                                color: '#2563eb',
                                lineHeight: 0.9,
                                fontWeight: 500
                              }}
                            >
                              {user.phone}
                            </Typography>
                          </Typography>
                        }
                        sx={{
                          my: 0,
                          '& .MuiListItemText-primary': {
                            fontSize: '1rem',
                            fontWeight: 500,
                            lineHeight: 1.2
                          },
                          '& .MuiListItemText-secondary': {
                            marginTop: 0.5
                          }
                        }}
                      />
                    </ListItem>
                    <Divider component="li" sx={{ mx: 1 }} />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 1,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                    padding: 0
                  },
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                אין משתמשים להצגה.
              </Alert>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 0.5,
              p: 0.25,
              borderRadius: 0.5,
              bgcolor: 'primary.light',
              color: 'primary.dark'
            }}>
              <Typography variant="caption" fontSize="0.75rem" fontWeight="bold">
                סה"כ המשתמשים: {filteredUsers.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {selectedUser && (
          <Card 
            elevation={0}
            sx={{ 
              width: { xs: '100%', md: '50%' },
              borderRadius: 3,
              background: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 150px)',
              minHeight: '600px',
              '&:hover': {
                boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}>
              <Box>
                <Typography 
                  variant="body1" 
                  fontWeight="bold" 
                  color="primary.main"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.875rem'
                  }}
                >
                  <PersonIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={getRoleDisplayName(selectedUser.rols)}
                    size="small"
                    sx={{ 
                      height: 24,
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      bgcolor: selectedUser.rols === 'admin' ? 'error.dark' : 
                            selectedUser.rols === 'gabai' ? 'success.dark' : 
                            selectedUser.rols === 'manager' ? 'info.dark' : 'primary.dark',
                      fontWeight: 'medium'
                    }}
                  />
                </Box>
              </Box>
              {!isEditing && !isAddingAliya && canEditUser(selectedUser) && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    color="primary" 
                    onClick={handleEdit}
                    size="small"
                    sx={{ 
                      p: 0.5,
                      bgcolor: 'primary.light',
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    color="success" 
                    onClick={handleAddDebt}
                    size="small"
                    sx={{ 
                      p: 0.5,
                      bgcolor: 'success.light',
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: 'success.main',
                      },
                      zIndex: 1200,
                      position: 'relative'
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  {currentUserRole === 'admin' && selectedUser.rols !== 'admin' && (
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(selectedUser)}
                      size="small"
                      sx={{ 
                        p: 0.5,
                        bgcolor: 'error.light',
                        color: '#ffffff',
                        '&:hover': {
                          bgcolor: 'error.main',
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
            <CardContent sx={{ 
              p: 3,
              overflow: 'auto',
              flex: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f5f9',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#94a3b8',
                borderRadius: '3px',
                '&:hover': {
                  background: '#64748b',
                }
              }
            }}>
              {isEditing ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2.5
                }}>
                  <TextField 
                    label="שם פרטי" 
                    name="firstName" 
                    value={editedUser.firstName || ''} 
                    onChange={handleInputChange} 
                    fullWidth 
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '2px'
                          }
                        },
                        '&.Mui-focused': {
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
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
                  {canEditRole(selectedUser) && (
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
                        {getRoleOptions()}
                      </Select>
                    </FormControl>
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 3,
                    gap: 2
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleUpdate}
                      disabled={updateLoading}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        color: '#ffffff',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#94a3b8',
                        color: '#475569',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          borderColor: '#64748b',
                          bgcolor: '#f1f5f9',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      ביטול
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 3
                }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="800" 
                    color="#2c3e50"
                    sx={{ 
                      pb: 2,
                      borderBottom: '2px solid',
                      borderColor: theme.palette.primary.main
                    }}
                  >
                    פרטים אישיים
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2,
                      overflow: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(0,0,0,0.3)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#3b82f6',
                          fontSize: '1.5rem'
                        }}
                      >
                        {selectedUser?.firstName?.[0] || ''}
                      </Avatar>
                      <Typography variant="h6">
                        {selectedUser?.firstName} {selectedUser?.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        component="span" 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ width: 120 }}
                      >
                        שם אב:
                      </Typography>
                      <Typography 
                        component="span" 
                        variant="body1" 
                        fontWeight="medium"
                      >
                        {selectedUser.fatherName || 'לא צוין'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        component="span" 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ width: 120 }}
                      >
                        טלפון:
                      </Typography>
                      <Typography 
                        component="span" 
                        variant="body1" 
                        fontWeight="medium"
                      >
                        {selectedUser.phone || 'לא צוין'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        component="span" 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ width: 120 }}
                      >
                        תפקיד:
                      </Typography>
                      <Chip
                        label={getRoleDisplayName(selectedUser.rols)}
                        size="small"
                        sx={{ 
                          color: '#ffffff',
                          bgcolor: selectedUser.rols === 'admin' ? 'error.dark' : 
                                selectedUser.rols === 'gabai' ? 'success.dark' : 
                                selectedUser.rols === 'manager' ? 'info.dark' : 'primary.dark',
                          fontWeight: 'medium'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add New Debt Dialog */}
        <Dialog 
          open={isAddingDebt} 
          onClose={() => setIsAddingDebt(false)}
          fullWidth={false}
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
              background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
              p: 3,
              maxWidth: '100%',
              overflow: 'hidden',
              minHeight: '400px',
              mt: -2
            }
          }}
          dir="rtl"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            py: 0.5,
            px: 1,
            maxWidth: '100%',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h4" component="div" fontWeight="400" sx={{ fontSize: '0.875rem' }}>
              הוספת חוב חדש ל{selectedUser?.firstName} {selectedUser?.lastName}
            </Typography>
            <IconButton 
              onClick={() => setIsAddingDebt(false)}
              size="small"
              sx={{ 
                color: '#ffffff',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ 
            pt: '16px !important',
            pb: 2,
            px: 2,
            '& .MuiTextField-root, & .MuiFormControl-root': {
              mb: 1.5,
              mt: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.875rem',
                '& input': {
                  padding: '8px 14px'
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.875rem'
              }
            }
          }}>
            <TextField
              label="סכום"
              name="amount"
              value={newDebt.amount}
              onChange={handleDebtInputChange}
              fullWidth
              variant="outlined"
              type="number"
              size="small"
              InputProps={{
                startAdornment: (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mr: 0.5,
                      color: 'primary.main',
                      fontWeight: 'bold'
                    }}
                  >
                    ₪
                  </Typography>
                ),
              }}
            />
            
            <TextField
              label="פרשה"
              name="parsha"
              value={newDebt.parsha}
              onChange={handleDebtInputChange}
              fullWidth
              variant="outlined"
              size="small"
            />
            
            <FormControl fullWidth size="small">
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
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    size: "small",
                    sx: { mt: 1.5 }
                  } 
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ 
            px: 2, 
            py: 1.5, 
            bgcolor: 'grey.50',
            gap: 1
          }}>
            <Button 
              variant="outlined" 
              onClick={() => setIsAddingDebt(false)}
              size="small"
              sx={{ 
                borderRadius: 1,
                px: 2,
                py: 0.5,
                borderColor: 'grey.400',
                color: 'grey.700',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'grey.500',
                  bgcolor: 'grey.100'
                }
              }}
            >
              ביטול
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveDebt}
              disabled={addAliyaLoading}
              size="small"
              sx={{ 
                borderRadius: 1,
                px: 3,
                py: 0.5,
                bgcolor: 'success.main',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'success.dark',
                }
              }}
            >
              {addAliyaLoading ? <CircularProgress size={16} /> : 'שמור'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={cancelDelete}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>אישור מחיקה</DialogTitle>
          <DialogContent>
            <Typography>האם אתה בטוח שברצונך למחוק את המשתמש {selectedUser?.firstName} {selectedUser?.lastName}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="primary">ביטול</Button>
            <Button onClick={confirmDelete} color="secondary">מחק</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Management;