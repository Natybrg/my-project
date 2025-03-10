import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Paper,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Pagination,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  AccountBalance as GabaiIcon,
  Business as ManagerIcon
} from '@mui/icons-material';
import './UserList.css';

/**
 * Enhanced User List Component
 * @param {Object} props - Component props
 * @param {Array} props.users - List of users
 * @param {Function} props.onEditUser - Function to handle edit user
 * @param {Function} props.onDeleteUser - Function to handle delete user
 * @param {boolean} props.loading - Loading state
 */
const UserList = ({ users = [], onEditUser, onDeleteUser, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Get role icon based on user role
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'gabai':
        return <GabaiIcon />;
      case 'manager':
        return <ManagerIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'מנהל';
      case 'gabai':
        return 'גבאי';
      case 'manager':
        return 'מנהל בית כנסת';
      default:
        return 'משתמש';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div>
      <Box className="search-filter-container">
        <TextField
          className="search-field"
          label="חיפוש משתמשים"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" className="role-filter">
          <InputLabel>סינון לפי תפקיד</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="סינון לפי תפקיד"
          >
            <MenuItem value="all">הכל</MenuItem>
            <MenuItem value="admin">מנהל</MenuItem>
            <MenuItem value="gabai">גבאי</MenuItem>
            <MenuItem value="manager">מנהל בית כנסת</MenuItem>
            <MenuItem value="user">משתמש</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Paper className="user-list-container">
        <Box className="user-list-header">
          <Typography variant="h6" className="user-list-title">
            רשימת משתמשים ({filteredUsers.length})
          </Typography>
        </Box>
        
        <Divider />
        
        <List className="user-list">
          {loading ? (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography align="center">טוען משתמשים...</Typography>
                } 
              />
            </ListItem>
          ) : paginatedUsers.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography align="center">לא נמצאו משתמשים</Typography>
                } 
              />
            </ListItem>
          ) : (
            paginatedUsers.map((user) => (
              <ListItem key={user._id} className="user-list-item">
                <ListItemAvatar>
                  <Avatar className={`user-avatar ${user.role}`}>
                    {getUserInitials(user.firstName, user.lastName)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography className="user-name">
                      {user.firstName} {user.lastName}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography component="span" className="user-email">
                        {user.email}
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={getRoleDisplayName(user.role)}
                          size="small"
                          className={`user-role-chip ${user.role}`}
                        />
                        {user.synagogue && (
                          <Chip
                            label={user.synagogue}
                            size="small"
                            className="user-role-chip"
                          />
                        )}
                      </Box>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Box className="user-action-buttons">
                    <Tooltip title="ערוך משתמש">
                      <span>
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={() => onEditUser(user)}
                          className="user-action-button"
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="מחק משתמש">
                      <span>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => onDeleteUser(user._id)}
                          className="user-action-button"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
        
        {filteredUsers.length > itemsPerPage && (
          <Box className="pagination-container">
            <Pagination
              count={Math.ceil(filteredUsers.length / itemsPerPage)}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </div>
  );
};

export default UserList;