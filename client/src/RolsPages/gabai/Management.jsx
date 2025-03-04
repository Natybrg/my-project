import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { getAllUsers, updateUser, createAliya } from '../../services/api';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: '',
    phone: '',
    fatherName: '',
    lastName: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newAliya, setNewAliya] = useState({
    amount: 0,
    parsha: '',
    aliyaType: '',
    isPaid: false,
  });
  const [isAddingAliya, setIsAddingAliya] = useState(false);
  const [createAliyaLoading, setCreateAliyaLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.response?.data || { message: 'שגיאה בטעינת המשתמשים.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateAliya = async () => {
    try {
      setCreateAliyaLoading(true);

      if (!selectedUser || !newAliya.amount || !newAliya.parsha || !newAliya.aliyaType || newAliya.isPaid === undefined) {
        setError({ message: 'אנא מלא את כל השדות הנדרשים.' });
        setCreateAliyaLoading(false);
        return;
      }

      await createAliya(selectedUser._id, newAliya);
      setSuccessMessage('עלייה נוצרה בהצלחה!');
      setNewAliya({ amount: 0, parsha: '', aliyaType: '', isPaid: false });
      setIsAddingAliya(false);
    } catch (error) {
      console.error('Error creating aliya:', error);
      setError(error.response?.data || { message: 'שגיאה ביצירת עלייה.' });
    } finally {
      setCreateAliyaLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsAddingAliya(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...selectedUser });
  };

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const response = await updateUser(selectedUser._id, editedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === selectedUser._id ? response : user))
      );
      setSelectedUser(response);
      setIsEditing(false);
      setSuccessMessage('משתמש עודכן בהצלחה!');
    } catch (error) {
      console.error('Error updating user:', error);
      setError('שגיאה בעדכון משתמש.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleAliyaInputChange = (e) => {
    setNewAliya({ ...newAliya, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessMessage(null);
  };

  const filteredUsers = users.filter((user) =>
    user && user.phone && user.phone.includes(searchPhone)
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 3 }}>
      <Paper sx={{ width: '40%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          רשימת משתמשים
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="חפש לפי מספר טלפון"
            variant="outlined"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mr: 1 }}
          />
        </Box>
        {loading && <Typography>טוען...</Typography>}
        {error && <Typography color="error">{error.message}</Typography>}
        {filteredUsers.length > 0 ? (
          <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredUsers.map((user) => (
              <ListItem key={user._id} onClick={() => handleUserClick(user)}>
                <ListItemText primary={user.firstName} sx={{ color: 'primary.main' }} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>אין משתמשים להצגה.</Typography>
        )}
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          סה"כ המשתמשים: {filteredUsers.length}
        </Typography>
      </Paper>

      {selectedUser && (
        <Paper sx={{ width: '40%', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedUser.firstName}
          </Typography>
          {isEditing ? (
            <Box>
              <TextField label="שם פרטי" name="firstName" value={editedUser.firstName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="טלפון" name="phone" value={editedUser.phone} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="שם אב" name="fatherName" value={editedUser.fatherName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="שם משפחה" name="lastName" value={editedUser.lastName} onChange={handleInputChange} fullWidth margin="normal" />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" onClick={handleUpdate} disabled={updateLoading}>
                  {updateLoading ? <CircularProgress size={24} /> : 'שמור'}
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  ביטול
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button variant="contained" onClick={handleEdit}>
                עריכה
              </Button>
              <Button variant="contained" onClick={() => setIsAddingAliya(true)}>
                +
              </Button>
            </Box>
          )}
          {isAddingAliya && (
            <Box>
              <Typography variant="h6" gutterBottom>
                הוספת עלייה
              </Typography>
              <TextField label="סכום" name="amount" type="number" value={newAliya.amount} onChange={handleAliyaInputChange} fullWidth margin="normal" />
              <TextField label="פרשה" name="parsha" value={newAliya.parsha} onChange={handleAliyaInputChange} fullWidth margin="normal" />
              <TextField label="סוג עלייה" name="aliyaType" value={newAliya.aliyaType} onChange={handleAliyaInputChange} fullWidth margin="normal" />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" onClick={handleCreateAliya} disabled={createAliyaLoading}>
                  {createAliyaLoading ? <CircularProgress size={24} /> : 'שמור'}
                </Button>
                <Button variant="outlined" onClick={() => setIsAddingAliya(false)}>
                  ביטול
                </Button>
              </Box>
              {error && <Typography color="error" variant="body2" gutterBottom>{error.message}</Typography>}
            </Box>
          )}
        </Paper>
      )}
      <Snackbar
        open={successMessage !== null}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage;
