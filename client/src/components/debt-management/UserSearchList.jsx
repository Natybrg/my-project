import React from 'react';
import {
  Paper,
  List,
  ListItem,
  Divider,
  Box,
  CircularProgress,
  Typography,
  Avatar,
  Chip,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import './UserSearchList.css';

/**
 * Component for displaying searchable user list
 * @param {Array} users - Array of user objects
 * @param {boolean} loading - Loading state
 * @param {Function} onSelectUser - Function to handle user selection
 */
const UserSearchList = ({ users = [], loading = false, onSelectUser }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderUserItem = (user, index) => (
    <React.Fragment key={user._id || index}>
      <ListItem 
        disablePadding 
        className="user-list-item"
      >
        <ListItemButton onClick={() => onSelectUser(user._id)}>
          <Avatar className="user-avatar" sx={{ mr: 2 }}>
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div" className="user-name">
                {`${user.firstName || ''} ${user.fatherName ? `בן ${user.fatherName}` : ''} ${user.lastName || ''}`}
              </Typography>
            }
            secondary={
              !user.phone && (
                <Typography variant="body2" component="span">
                  אין מספר טלפון
                </Typography>
              )
            }
            secondaryTypographyProps={{ component: "span" }}
          />
          
          {user.phone && (
            <Box component="span">
              <Chip
                icon={<PhoneIcon fontSize="small" />}
                label={user.phone}
                size="small"
                className="user-phone-chip"
                variant="outlined"
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          )}
        </ListItemButton>
      </ListItem>
      {index < users.length - 1 && <Divider component="li" />}
    </React.Fragment>
  );

  // Rest of the component remains unchanged
  const renderEmptyState = () => (
    <ListItem className="empty-list-item">
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="subtitle1">
          לא נמצאו
        </Typography>
        <CircularProgress size={40} />
        <Typography variant="body2" className="loading-text">
          טוען משתמשים...
        </Typography>
      </Box>
    </ListItem>
  );

  return (
    <>
      <Paper elevation={3} className="user-search-paper">
        <List className="user-list">
          {loading ? (
            renderEmptyState()
          ) : (
            users.length > 0 
              ? users.map((user, index) => renderUserItem(user, index))
              : <ListItem><Typography component="div">לא נמצאו תוצאות</Typography></ListItem>
          )}
        </List>
      </Paper>
    </>
  );
};

export default UserSearchList;