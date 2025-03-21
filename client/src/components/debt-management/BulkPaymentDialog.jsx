import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material';

/**
 * Dialog for bulk payment of debts 
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Function to handle dialog close
 * @param {string} paymentType - Payment type, either 'full' or 'partial'
 * @param {string} amount - Payment amount
 * @param {Function} onAmountChange - Function to handle amount change
 * @param {string} note - Payment note
 * @param {Function} onNoteChange - Function to handle note change
 * @param {number} totalUnpaid - Total unpaid amount
 * @param {Function} onSave - Function to handle save
 * @param {boolean} disabled - Whether the save button is disabled
 */
const BulkPaymentDialog = ({
  open,
  onClose,
  paymentType,
  amount,
  onAmountChange,
  note,
  onNoteChange,
  totalUnpaid,
  onSave,
  disabled
}) => {
  const title = paymentType === 'full' 
    ? 'אישור תשלום מלא של כל החובות'
    : 'תשלום חלקי של מרוכז';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
          overflow: 'hidden'
        }
      }}
      disableEscapeKeyDown
      BackdropProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" fontWeight="500">
          תשלום מרוכז
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          {paymentType === 'full' ? (
            <Typography variant="body1" gutterBottom>
              האם ברצונך לשלם את כל החובות הלא משולמים בסך ₪{totalUnpaid}?
            </Typography>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                הזן את הסכום שברצונך לשלם. הסכום יחולק בין החובות מהישן לחדש.
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                סך כל החובות הפתוחים: ₪{totalUnpaid}
              </Typography>
              <TextField
                margin="dense"
                label="סכום לתשלום"
                type="number"
                fullWidth
                value={amount}
                onChange={onAmountChange}
                inputProps={{ min: 0, max: totalUnpaid }}
                sx={{ mb: 2, mt: 1 }}
              />
            </>
          )}
          
          <TextField
            margin="dense"
            label="הערה (אופציונלי)"
            type="text"
            fullWidth
            value={note}
            onChange={onNoteChange}
            multiline
            rows={2}
            sx={{ mb: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button 
          onClick={onSave} 
          color="primary"
          disabled={disabled}
        >
          {paymentType === 'full' ? 'שלם הכל' : 'בצע תשלום'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkPaymentDialog;
