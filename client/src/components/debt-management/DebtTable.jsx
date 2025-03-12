import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Dialog, // Add this import
  DialogTitle, // Add this import
  DialogContent, // Add this import
  DialogContentText, // Add this import
  DialogActions, // Add this import
  Button // Add this import
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete'; // Add this import
import axios from 'axios';
import { updatePaymentStatus, checkAuth } from '../../services/api'; // Move the import here
import './DebtTable.css';

/**
 * Format a date string to local date
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
};

/**
 * Component to display debt table
 * @param {Array} debts - Array of debt objects
 * @param {boolean} loading - Loading state
 * @param {Function} onEditDebt - Function to handle edit debt
 * @param {Function} onMarkAsPaid - Function to handle mark as paid
 * @param {Function} onPartialPayment - Function to handle partial payment
 * @param {boolean} disableActions - Whether to disable action buttons
 * @param {Function} onDebtUpdated - Callback when debt is updated
 */
const DebtTable = ({ 
  debts = [], 
  loading = false, 
  onEditDebt, 
  onMarkAsPaid, 
  onPartialPayment,
  disableActions = false,
  onDebtUpdated,
  user = {} // Default to an empty object if user is undefined
}) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingDebtId, setUpdatingDebtId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ open: false, debt: null });
  const [authInfo, setAuthInfo] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const fetchAuthInfo = async () => {
      try {
        const authData = await checkAuth();
        console.log('Auth info:', authData);
        setAuthInfo(authData);
      } catch (error) {
        console.error('Error fetching auth info:', error);
      }
    };

    fetchAuthInfo();
  }, []);

  const handleAction = (actionFn, ...args) => {
    if (!actionFn || disableActions) {
      console.log('Action unavailable or disabled');
      return;
    }
    actionFn(...args);
  };

  // Define the handleCloseSnackbar function
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Check if the user has permission to perform actions on a debt
  const hasPermission = (debt) => {
    if (!authInfo || !authInfo.isAuthenticated) {
      return false;
    }
    
    // Admin, gabai, and manager roles have permission to perform actions on all debts
    if (['admin', 'gabai', 'manager'].includes(authInfo.role)) {
      return true;
    }
    
    // Regular users can only perform actions on their own debts
    return debt.userId === authInfo.userId;
  };

  // Define the handleMarkAsPaid function
  const handleMarkAsPaid = async (debt) => {
    if (!debt?._id) return;
    
    // Check if the user has permission
    if (!hasPermission(debt)) {
      setSnackbar({
        open: true,
        message: 'אין לך הרשאה לסמן חוב זה כשולם',
        severity: 'error'
      });
      return;
    }

    try {
      setUpdatingDebtId(debt._id);
      
      // Log the debt ID being paid
      console.log('Marking debt as paid with ID:', debt._id);
      console.log('Current auth info:', authInfo);
      
      // Use the debtService instead of direct axios call
      const response = await import('../../services/debtService')
        .then(module => module.updatePaymentStatus(debt._id, true));
      
      console.log('Debt marked as paid successfully');
      
      setSnackbar({
        open: true,
        message: 'החוב סומן כשולם בהצלחה',
        severity: 'success'
      });

      if (onDebtUpdated) {
        // Add a small delay to ensure the server has time to process the update
        setTimeout(() => {
          console.log('Triggering debt list refresh after marking as paid');
          onDebtUpdated(debt._id, 'update');
        }, 300);
      }
    } catch (err) {
      console.error('Failed to mark debt as paid:', err);
      
      // Check if it's a 403 error
      if (err.response && err.response.status === 403) {
        setSnackbar({
          open: true,
          message: 'אין לך הרשאה לסמן חוב זה כשולם',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'אירעה שגיאה בסימון החוב כשולם',
          severity: 'error'
        });
      }
    } finally {
      setUpdatingDebtId(null);
    }
  };

  // Define the handlePartialPayment function
  const handlePartialPayment = async (debt) => {
    if (!debt?._id) return;
    
    // Check if the user has permission
    if (!hasPermission(debt)) {
      setSnackbar({
        open: true,
        message: 'אין לך הרשאה לבצע תשלום חלקי לחוב זה',
        severity: 'error'
      });
      return;
    }

    // Instead of making the payment directly, call the onPartialPayment function
    // which will open a dialog for the user to enter the amount
    if (onPartialPayment) {
      onPartialPayment(debt);
    }
  };

  const handleDeleteDebt = async (debt) => {
    if (!debt?._id) return;
    
    // Check if the user has permission
    if (!hasPermission(debt)) {
      setSnackbar({
        open: true,
        message: 'אין לך הרשאה למחוק חוב זה',
        severity: 'error'
      });
      return;
    }

    try {
      setUpdatingDebtId(debt._id);
      
      // Log the debt ID being deleted
      console.log('Deleting debt with ID:', debt._id);
      
      // Use the debtService instead of direct axios call
      const response = await import('../../services/debtService')
        .then(module => module.deleteDebt(debt._id));
      
      console.log('Debt deleted successfully');
      
      setSnackbar({
        open: true,
        message: 'החוב נמחק בהצלחה',
        severity: 'success'
      });
      
      // Force a refresh of the debt list
      if (onDebtUpdated) {
        // Add a small delay to ensure the server has time to process the deletion
        setTimeout(() => {
          console.log('Triggering debt list refresh after deletion');
          onDebtUpdated(debt._id, 'delete');
        }, 300);
      }
    } catch (err) {
      console.error('Failed to delete debt:', err);
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה במחיקת החוב',
        severity: 'error'
      });
    } finally {
      setUpdatingDebtId(null);
    }
  };

  const handleConfirmDelete = (debt) => {
    setConfirmDelete({ open: true, debt });
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete({ open: false, debt: null });
  };

  const handleConfirmDeleteAction = () => {
    if (confirmDelete.debt) {
      handleDeleteDebt(confirmDelete.debt);
    }
    handleCloseConfirmDelete();
  };

  return (
    <>
      <Typography variant="h6">
        {user.firstName || 'Unknown'} {user.lastName || 'User'} {/* Display user's first and last name */}
      </Typography>
      <TableContainer component={Paper} className="debt-table-container">
        <Table className="debt-table">
          <TableHead>
            <TableRow>
              <TableCell className="table-header">תאריך</TableCell>
              <TableCell className="table-header">פרשה</TableCell>
              <TableCell className="table-header">סוג עלייה</TableCell>
              <TableCell className="table-header">סכום</TableCell>
              <TableCell className="table-header">שולם</TableCell>
              <TableCell className="table-header">נותר</TableCell>
              <TableCell className="table-header">סטטוס</TableCell>
              <TableCell className="table-header">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="loading-cell">
                  <CircularProgress size={24} />
                  <Typography variant="body2" className="loading-text">
                    טוען נתונים...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : !debts?.length ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="empty-cell">
                  <Typography variant="body1">
                    אין חובות למשתמש זה
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => (
                <TableRow key={debt._id} className={debt.isPaid ? 'paid-row' : ''}>
                  <TableCell>{formatDate(debt.date)}</TableCell>
                  <TableCell>{debt.parsha}</TableCell>
                  <TableCell>
                    <Chip 
                      label={debt.aliyaType} 
                      size="small" 
                      className={`aliya-type-chip ${debt.aliyaType?.replace(/\s+/g, '-').toLowerCase() || ''}`}
                    />
                  </TableCell>
                  <TableCell className="amount-cell">₪{debt.amount}</TableCell>
                  <TableCell className="paid-amount-cell">₪{debt.paidAmount || 0}</TableCell>
                  <TableCell className="remaining-amount-cell">
                    ₪{Math.max(0, debt.amount - (debt.paidAmount || 0))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={debt.isPaid ? "שולם" : "לא שולם"}
                      color={debt.isPaid ? "success" : "error"}
                      size="small"
                      className="status-chip"
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="action-buttons">
                      <Tooltip title="עריכה" disableInteractive>
                        <span>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleAction(onEditDebt, debt)}
                            disabled={disableActions || updatingDebtId === debt._id}
                            className="action-button edit-button"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      {!debt.isPaid && (
                        <>
                          <Tooltip title="סמן כשולם">
                            <span>
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleMarkAsPaid(debt)}
                                disabled={disableActions || updatingDebtId === debt._id}
                                className="action-button paid-button"
                              >
                                {updatingDebtId === debt._id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          
                          <Tooltip title="תשלום חלקי">
                            <span>
                              <IconButton
                                color="secondary"
                                size="small"
                                onClick={() => handlePartialPayment(debt)}
                                disabled={disableActions || updatingDebtId === debt._id}
                                className="action-button partial-button"
                              >
                                {updatingDebtId === debt._id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <PaymentIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                      {/* Add delete button */}
                      <Tooltip title="מחק חוב">
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleConfirmDelete(debt)}
                            disabled={disableActions || updatingDebtId === debt._id}
                            className="action-button delete-button"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation dialog for delete action */}
      <Dialog
        open={confirmDelete.open}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
        container={document.body}
        disablePortal={false}
        keepMounted
      >
        <DialogTitle id="confirm-delete-dialog-title">אישור מחיקה</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-dialog-description">
            האם אתה בטוח שברצונך למחוק את החוב?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete} color="primary">
            ביטול
          </Button>
          <Button onClick={handleConfirmDeleteAction} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DebtTable;