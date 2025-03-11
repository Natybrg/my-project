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
  Divider,
  Card,
  CardHeader,
  useTheme,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  AccountBalance as GabaiIcon,
  Business as ManagerIcon,
  FilterList as FilterIcon
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
  const theme = useTheme();

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    if (!user.firstName || !user.lastName || !user.email) return false;
    
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
    switch (role?.toLowerCase()) {
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
    switch (role?.toLowerCase()) {
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
    if (!firstName || !lastName) return '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get role color based on user role
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return theme.palette.error.light;
      case 'gabai':
        return theme.palette.secondary.light;
      case 'manager':
        return theme.palette.success.light;
      default:
        return theme.palette.primary.light;
    }
  };

  return (
    <Box className="user-list-page" sx={{ width: '100%' }}>
      <Card 
        className="filter-card" 
        elevation={3}
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[6],
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardHeader 
          avatar={<FilterIcon color="primary" />}
          title={<Typography variant="h6">סינון וחיפוש</Typography>}
          className="filter-card-header"
          sx={{ bgcolor: 'background.filterHeader', py: 1.5 }}
        />
        <Box className="search-filter-container" sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            sx={{ flexGrow: 1, minWidth: '250px' }}
          />
          
          <FormControl variant="outlined" className="role-filter" sx={{ minWidth: '200px' }}>
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
      </Card>
      
      <Paper 
        className="user-list-container" 
        elevation={3}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <Box 
          className="user-list-header"
          sx={{ 
            p: 2, 
            bgcolor: 'background.paperHeader',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            variant="h6" 
            className="user-list-title"
            sx={{ 
              fontWeight: 'bold',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 40,
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 1
              }
            }}
          >
            רשימת משתמשים ({filteredUsers.length})
          </Typography>
        </Box>
        
        <List className="user-list" sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Stack spacing={2} alignItems="center">
                <Box sx={{ display: 'flex' }}>
                  <Box className="loading-dot" sx={{ bgcolor: 'primary.main', width: 12, height: 12, borderRadius: '50%', mx: 0.5 }}></Box>
                  <Box className="loading-dot" sx={{ bgcolor: 'primary.main', width: 12, height: 12, borderRadius: '50%', mx: 0.5 }}></Box>
                  <Box className="loading-dot" sx={{ bgcolor: 'primary.main', width: 12, height: 12, borderRadius: '50%', mx: 0.5 }}></Box>
                </Box>
                <Typography>טוען משתמשים...</Typography>
              </Stack>
            </Box>
          ) : paginatedUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">לא נמצאו משתמשים</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                נסה לשנות את החיפוש או לבדוק שיש משתמשים במערכת
              </Typography>
            </Box>
          ) : (
            paginatedUsers.map((user) => (
              <ListItem 
                key={user._id} 
                className="user-list-item"
                sx={{ 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(-4px)'
                  },
                  py: 1.5
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    className={`user-avatar ${user.role || ''}`}
                    sx={{ 
                      bgcolor: getRoleColor(user.role),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {getUserInitials(user.firstName, user.lastName)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography 
                      className="user-name"
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      {user.firstName} {user.lastName}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography 
                        component="span" 
                        className="user-email"
                        variant="body2"
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                          mb: 0.5
                        }}
                      >
                        {user.email}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={getRoleDisplayName(user.role)}
                          size="small"
                          className={`user-role-chip ${user.role || ''}`}
                          sx={{ 
                            bgcolor: getRoleColor(user.role),
                            color: theme.palette.getContrastText(getRoleColor(user.role)),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                            }
                          }}
                        />
                        {user.synagogue && (
                          <Chip
                            label={user.synagogue}
                            size="small"
                            className="user-role-chip"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </React.Fragment>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <ListItemSecondaryAction>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Tooltip title="ערוך משתמש">
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => onEditUser(user)}
                        className="user-action-button"
                        sx={{ 
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-3px) scale(1.05)',
                            boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק משתמש">
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => onDeleteUser(user._id)}
                        className="user-action-button"
                        sx={{ 
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-3px) scale(1.05)',
                            boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
        
        {filteredUsers.length > itemsPerPage && (
          <Box 
            className="pagination-container"
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default'
            }}
          >
            <Pagination
              count={Math.ceil(filteredUsers.length / itemsPerPage)}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: 'action.hover'
                  }
                }
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserList;