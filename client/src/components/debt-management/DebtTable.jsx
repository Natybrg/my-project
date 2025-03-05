import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

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
 */
const DebtTable = ({ 
  debts, 
  loading, 
  onEditDebt, 
  onMarkAsPaid, 
  onPartialPayment,
  disableActions = false 
}) => {
  // Prevent any action if actions are disabled
  const handleAction = (actionFn, ...args) => {
    if (disableActions) {
      console.log('Actions are disabled, ignoring click');
      return;
    }
    actionFn(...args);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>תאריך</TableCell>
            <TableCell>פרשה</TableCell>
            <TableCell>סוג עלייה</TableCell>
            <TableCell>סכום</TableCell>
            <TableCell>שולם</TableCell>
            <TableCell>נותר</TableCell>
            <TableCell>סטטוס</TableCell>
            <TableCell>פעולות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : debts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                אין חובות למשתמש זה
              </TableCell>
            </TableRow>
          ) : (
            debts.map((debt) => (
              <TableRow key={debt._id}>
                <TableCell>{formatDate(debt.date)}</TableCell>
                <TableCell>{debt.parsha}</TableCell>
                <TableCell>{debt.aliyaType}</TableCell>
                <TableCell>₪{debt.amount}</TableCell>
                <TableCell>₪{debt.paidAmount || 0}</TableCell>
                <TableCell>
                  ₪{(debt.amount - (debt.paidAmount || 0)) > 0 
                    ? (debt.amount - (debt.paidAmount || 0)) 
                    : 0}
                </TableCell>
                <TableCell>
                  {debt.isPaid ? (
                    <Typography color="success.main">שולם</Typography>
                  ) : (
                    <Typography color="error.main">לא שולם</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleAction(onEditDebt, debt)}
                      disabled={disableActions}
                      sx={{
                        pointerEvents: disableActions ? 'none' : 'auto',
                        opacity: disableActions ? 0.5 : 1
                      }}
                    >
                      עריכה
                    </Button>
                    {!debt.isPaid && (
                      <>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleAction(onMarkAsPaid, debt._id)}
                          disabled={disableActions}
                          sx={{
                            pointerEvents: disableActions ? 'none' : 'auto',
                            opacity: disableActions ? 0.5 : 1
                          }}
                        >
                          סמן כשולם
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleAction(onPartialPayment, debt)}
                          disabled={disableActions}
                          sx={{
                            pointerEvents: disableActions ? 'none' : 'auto',
                            opacity: disableActions ? 0.5 : 1
                          }}
                        >
                          תשלום חלקי
                        </Button>
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
  );
};

export default DebtTable;
