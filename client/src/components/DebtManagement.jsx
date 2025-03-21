import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, 
  DialogTitle, IconButton, Typography, Box, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getUserDebts, deleteDebt } from '../services/debtService';

const DebtManagement = ({ userId }) => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [actionResult, setActionResult] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchDebts();
  }, [userId]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const data = await getUserDebts(userId);
      setDebts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load debts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (debt) => {
    setSelectedDebt(debt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDebt(selectedDebt._id);
      setActionResult({ 
        message: 'החוב נמחק בהצלחה', 
        type: 'success' 
      });
      // Remove the deleted debt from the state
      setDebts(debts.filter(debt => debt._id !== selectedDebt._id));
    } catch (err) {
      setActionResult({ 
        message: 'שגיאה במחיקת החוב: ' + err.message, 
        type: 'error' 
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDebt(null);
      // Clear the action result message after 5 seconds
      setTimeout(() => {
        setActionResult({ message: '', type: '' });
      }, 5000);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDebt(null);
  };

  if (loading) return <Typography>טוען נתונים...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {actionResult.message && (
        <Alert severity={actionResult.type} sx={{ mb: 2 }}>
          {actionResult.message}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>פרשה</TableCell>
              <TableCell>סוג עלייה</TableCell>
              <TableCell>סכום</TableCell>
              <TableCell>שולם</TableCell>
              <TableCell>סכום ששולם</TableCell>
              <TableCell>יתרה</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  אין חובות להצגה
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => (
                <TableRow key={debt._id}>
                  <TableCell>{debt.parsha}</TableCell>
                  <TableCell>{debt.aliyaType}</TableCell>
                  <TableCell>{debt.amount} ₪</TableCell>
                  <TableCell>{debt.isPaid ? 'כן' : 'לא'}</TableCell>
                  <TableCell>{debt.paidAmount} ₪</TableCell>
                  <TableCell>{debt.amount - debt.paidAmount} ₪</TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(debt)}
                      title="מחק חוב"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      title="ערוך חוב"
                      // Add edit functionality here
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>אישור מחיקת חוב</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את החוב הזה?
            {selectedDebt && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>פרשה:</strong> {selectedDebt.parsha}</Typography>
                <Typography><strong>סוג עלייה:</strong> {selectedDebt.aliyaType}</Typography>
                <Typography><strong>סכום:</strong> {selectedDebt.amount} ₪</Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DebtManagement;