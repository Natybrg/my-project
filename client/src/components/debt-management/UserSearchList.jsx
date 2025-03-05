import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';

/**
 * Component for displaying searchable user list
 * @param {Array} users - Array of user objects
 * @param {boolean} loading - Loading state
 * @param {Function} onSelectUser - Function to handle user selection
 */
const UserSearchList = ({ users, loading, onSelectUser }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3}>
      <List>
        {users.length > 0 ? (
          users.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => onSelectUser(user._id)}>
                  <ListItemText
                    primary={`${user.firstName} בן ${user.fatherName} ${user.lastName}`}
                    secondary={`טלפון: ${user.phone}`}
                  />
                </ListItemButton>
              </ListItem>
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary="לא נמצאו משתמשים"
              secondary="נסה לשנות את החיפוש או לבדוק שיש משתמשים במערכת"
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default UserSearchList;
