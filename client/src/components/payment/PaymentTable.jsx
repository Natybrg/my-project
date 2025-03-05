import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Box
} from "@mui/material";

const PaymentTable = ({ 
  payments, 
  updatingId, 
  onPaymentUpdate, 
  onOpenPartialPayment 
}) => {
  // תאריך בפורמט עברי
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2, 
        boxShadow: 3, 
        borderRadius: 2,
        maxHeight: 450, 
        overflow: 'auto'  
      }}
    >
      <Table stickyHeader>
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>פרשה</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>סוג עלייה</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>סכום</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell align="center" colSpan={5}>
                <Typography variant="body1">אין עליות להצגה</Typography>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment._id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                <TableCell align="center">
                  {formatDate(payment.date)}
                </TableCell>
                <TableCell align="center">{payment.parsha || "-"}</TableCell>
                <TableCell align="center">{payment.aliyaType || "-"}</TableCell>
                <TableCell align="center">₪{payment.amount}</TableCell>
                <TableCell align="center">
                  {payment.isPaid ? (
                    <Box>
                      <Chip 
                        label="שולם" 
                        color="success" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }} 
                      />
                      {payment.paidDate && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {formatDate(payment.paidDate)}
                        </Typography>
                      )}
                      {payment.paymentHistory && payment.paymentHistory.length > 0 && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {payment.paymentHistory.length} תשלומים
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      {payment.paidAmount > 0 && (
                        <Typography variant="caption" display="block" color="primary" sx={{ mb: 1 }}>
                          שולם חלקית: ₪{payment.paidAmount} מתוך ₪{payment.amount}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => onPaymentUpdate(payment._id)}
                          disabled={!!updatingId}
                          sx={{ minWidth: '80px' }}
                        >
                          {updatingId === payment._id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            "שלם במלואו"
                          )}
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => onOpenPartialPayment(payment)}
                          disabled={!!updatingId}
                          sx={{ minWidth: '80px' }}
                        >
                          שלם חלקית
                        </Button>
                      </Box>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentTable;
