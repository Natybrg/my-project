import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogContent
} from '@mui/material';
import { getAllUsers } from '../services/api';

// Import components
import SearchBar from '../components/debt-management/SearchBar';
import UserSearchList from '../components/debt-management/UserSearchList';
import UserDebtManager from '../components/debt-management/UserDebtManager';

const UserDebtsPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
        setError('');
      } catch (error) {
        setError(error.message || 'אירעה שגיאה בטעינת רשימת המשתמשים');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.fatherName} ${user.lastName}`.toLowerCase();
      const phone = user.phone;
      return fullName.includes(query.toLowerCase()) || phone.includes(query);
    });
    
    setFilteredUsers(filtered);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  // Select user
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  // Close user debt dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUserId(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        ניהול חובות משתמשים
      </Typography>
      
      <SearchBar 
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <UserSearchList 
        users={filteredUsers}
        loading={loading}
        onSelectUser={handleSelectUser}
      />
      
      {/* User Debt Management Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
        disableEscapeKeyDown
        disableAutoFocus={true}
        BackdropProps={{ onClick: (e) => e.stopPropagation() }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedUserId && (
            <UserDebtManager
              userId={selectedUserId}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UserDebtsPage;
