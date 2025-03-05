import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material';

/**
 * Component for making partial payments
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Function to handle dialog close
 * @param {Object} debt - Debt object
 * @param {string} amount - Payment amount
 * @param {Function} onAmountChange - Function to handle amount change
 * @param {string} note - Payment note
 * @param {Function} onNoteChange - Function to handle note change
 * @param {Function} onSave - Function to handle save
 */
const PartialPaymentDialog = ({
  open,
  onClose,
  debt,
  amount,
  onAmountChange,
  note,
  onNoteChange,
  onSave
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      disableEscapeKeyDown
      BackdropProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>תשלום חלקי</DialogTitle>
      <DialogContent>
        {debt && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              חוב: ₪{debt.amount}
            </Typography>
            <Typography variant="body2">
              שולם: ₪{debt.paidAmount || 0}
            </Typography>
            <Typography variant="body2">
              נותר לתשלום: ₪{(debt.amount - (debt.paidAmount || 0)) > 0 
                ? (debt.amount - (debt.paidAmount || 0)) 
                : 0}
            </Typography>
          </Box>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="סכום תשלום"
          type="number"
          fullWidth
          value={amount}
          onChange={onAmountChange}
          inputProps={{ min: 0 }}
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          margin="dense"
          label="הערה (אופציונלי)"
          type="text"
          fullWidth
          value={note}
          onChange={onNoteChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={onSave} color="primary">
          בצע תשלום
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartialPaymentDialog;
