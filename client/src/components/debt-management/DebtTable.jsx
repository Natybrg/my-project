import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';
import './DebtTable.css';

/**
 * Format a date string to local date
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
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
  debts, 
  loading, 
  onEditDebt, 
  onMarkAsPaid, 
  onPartialPayment,
  disableActions = false,
  onDebtUpdated
}) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingDebtId, setUpdatingDebtId] = useState(null);

  // Prevent any action if actions are disabled
  const handleAction = (actionFn, ...args) => {
    if (disableActions) {
      console.log('Actions are disabled, ignoring click');
      return;
    }
    actionFn(...args);
  };

  // Handle marking debt as paid with server update
  const handleMarkAsPaid = async (debtId) => {
    try {
      setUpdatingDebtId(debtId);
      
      // Call the API to update the debt status
      const response = await axios.put(`/api/debts/${debtId}/pay`, {
        isPaid: true,
        paidAmount: debts.find(debt => debt._id === debtId).amount
      });
      
      // Call the callback to update the UI
      if (onDebtUpdated) {
        onDebtUpdated(response.data);
      }
      
      // Call the original handler
      onMarkAsPaid(debtId);
      
      setSnackbar({
        open: true,
        message: 'החוב סומן כשולם בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating debt:', error);
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה בעדכון החוב',
        severity: 'error'
      });
    } finally {
      setUpdatingDebtId(null);
    }
  };

  // Handle partial payment with server update
  const handlePartialPayment = async (debt) => {
    // First call the UI handler to get the partial payment amount
    handleAction(onPartialPayment, debt, async (partialAmount) => {
      if (partialAmount) {
        try {
          setUpdatingDebtId(debt._id);
          
          // Calculate the new paid amount
          const newPaidAmount = (debt.paidAmount || 0) + partialAmount;
          
          // Call the API to update the debt
          const response = await axios.put(`/api/debts/${debt._id}/partial-payment`, {
            paidAmount: newPaidAmount,
            isPaid: newPaidAmount >= debt.amount
          });
          
          // Call the callback to update the UI
          if (onDebtUpdated) {
            onDebtUpdated(response.data);
          }
          
          setSnackbar({
            open: true,
            message: `תשלום חלקי של ₪${partialAmount} נרשם בהצלחה`,
            severity: 'success'
          });
        } catch (error) {
          console.error('Error updating debt with partial payment:', error);
          setSnackbar({
            open: true,
            message: 'אירעה שגיאה בעדכון התשלום החלקי',
            severity: 'error'
          });
        } finally {
          setUpdatingDebtId(null);
        }
      }
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
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
            ) : debts.length === 0 ? (
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
                      className={`aliya-type-chip ${debt.aliyaType.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                  </TableCell>
                  <TableCell className="amount-cell">₪{debt.amount}</TableCell>
                  <TableCell className="paid-amount-cell">₪{debt.paidAmount || 0}</TableCell>
                  <TableCell className="remaining-amount-cell">
                    ₪{(debt.amount - (debt.paidAmount || 0)) > 0 
                      ? (debt.amount - (debt.paidAmount || 0)) 
                      : 0}
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
                      <Tooltip title="עריכה">
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
                                onClick={() => handleMarkAsPaid(debt._id)}
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
    </>
  );
};

export default DebtTable;
