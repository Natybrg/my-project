import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import './PartialPaymentDialog.css';

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
  const remainingAmount = debt ? Math.max(0, debt.amount - (debt.paidAmount || 0)) : 0;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      disableEscapeKeyDown
      BackdropProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
      maxWidth="sm"
      fullWidth
      className="partial-payment-dialog"
    >
      <DialogTitle className="dialog-title">
        <Box display="flex" alignItems="center">
          <PaymentIcon sx={{ mr: 1 }} />
          <Typography variant="h6">תשלום חלקי</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {debt && (
          <Paper elevation={2} className="debt-summary-paper">
            <Box className="debt-info-container">
              <Box className="debt-info-item">
                <Typography variant="subtitle2" className="debt-info-label">
                  סכום חוב
                </Typography>
                <Typography variant="h6" className="debt-info-value total-amount">
                  ₪{debt.amount}
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem />
              
              <Box className="debt-info-item">
                <Typography variant="subtitle2" className="debt-info-label">
                  שולם עד כה
                </Typography>
                <Typography variant="h6" className="debt-info-value paid-amount">
                  ₪{debt.paidAmount || 0}
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem />
              
              <Box className="debt-info-item">
                <Typography variant="subtitle2" className="debt-info-label">
                  נותר לתשלום
                </Typography>
                <Typography variant="h6" className="debt-info-value remaining-amount">
                  ₪{remainingAmount}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
        
        <Box className="payment-form">
          <TextField
            autoFocus
            margin="dense"
            label="סכום תשלום"
            type="number"
            fullWidth
            value={amount}
            onChange={onAmountChange}
            inputProps={{ min: 0, max: remainingAmount }}
            InputProps={{
              startAdornment: <InputAdornment position="start">₪</InputAdornment>,
            }}
            className="amount-input"
            helperText={`הסכום המקסימלי לתשלום: ₪${remainingAmount}`}
          />
          
          <TextField
            margin="dense"
            label="הערה (אופציונלי)"
            type="text"
            fullWidth
            value={note}
            onChange={onNoteChange}
            multiline
            rows={2}
            className="note-input"
          />
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} className="cancel-button">
          ביטול
        </Button>
        <Button 
          onClick={onSave} 
          variant="contained" 
          color="primary"
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
          className="save-button"
          startIcon={<PaymentIcon />}
        >
          בצע תשלום
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartialPaymentDialog;