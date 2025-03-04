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
} from '@mui/material';
import {getAllUsers} from '../../services/api';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers();
        setUsers(response);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        if (error.code === 'ERR_NETWORK') {
          setError('שגיאה: לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל בפורט 3001.');
        } else if (error.response) {
          setError(`שגיאה: שרת החזיר קוד סטטוס ${error.response.status}.`);
        } else {
          setError('שגיאה: לא ניתן לטעון את המשתמשים. אנא בדוק את ה-API או את החיבור לאינטרנט.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleEdit = () => {
    console.log('Edit user:', selectedUser);
  };

  const handleUpdate = () => {
    console.log('Update user:', selectedUser);
  };

  const handleSearch = () => {
    setSearchPhone('');
  };

  const filteredUsers = Array.isArray(users) // הוספת בדיקה כאן
    ? users.filter((user) => user.phone && user.phone.includes(searchPhone))
    : [];

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
          <Button variant="contained" onClick={handleSearch}>
            חיפוש
          </Button>
        </Box>
        {loading && <Typography>טוען...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {filteredUsers.length > 0 ? (
          <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredUsers.map((user) => (
              <ListItem key={user._id} button onClick={() => handleUserClick(user)}>
                <ListItemText primary={user.username} secondary={user.status} />
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
            {selectedUser.username}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button variant="contained" onClick={handleEdit}>
              עריכה
            </Button>
            <Button variant="contained" onClick={handleUpdate}>
              עדכון
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default UserManagementPage;

