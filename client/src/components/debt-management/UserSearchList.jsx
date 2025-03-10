import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  CircularProgress,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import './UserSearchList.css';

/**
 * Component for displaying searchable user list
 * @param {Array} users - Array of user objects
 * @param {boolean} loading - Loading state
 * @param {Function} onSelectUser - Function to handle user selection
 */
const UserSearchList = ({ users = [], loading = false, onSelectUser }) => {
  // Generate initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Paper elevation={3} className="user-search-paper">
        <Box className="loading-container">
          <CircularProgress size={40} />
          <Typography variant="body2" className="loading-text">
            טוען משתמשים...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} className="user-search-paper">
      <List className="user-list">
        {users.length > 0 ? (
          users.map((user, index) => (
            <React.Fragment key={user._id || index}>
              <ListItem disablePadding className="user-list-item">
                <ListItemButton 
                  onClick={() => onSelectUser(user._id)}
                  className="user-list-button"
                >
                  <Avatar className="user-avatar">
                    {getInitials(user.firstName, user.lastName)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" className="user-name">
                        {`${user.firstName || ''} ${user.fatherName ? `בן ${user.fatherName}` : ''} ${user.lastName || ''}`}
                      </Typography>
                    }
                    secondary={
                      <Box className="user-details">
                        {user.phone && (
                          <Chip
                            icon={<PhoneIcon fontSize="small" />}
                            label={user.phone}
                            size="small"
                            className="user-phone-chip"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < users.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))
        ) : (
          <ListItem className="empty-list-item">
            <ListItemText
              primary={
                <Typography variant="subtitle1" align="center">
                  לא נמצאו משתמשים
                </Typography>
              }
              secondary={
                <Typography variant="body2" align="center" color="textSecondary">
                  נסה לשנות את החיפוש או לבדוק שיש משתמשים במערכת
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default UserSearchList;
