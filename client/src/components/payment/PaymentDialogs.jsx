import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  DialogContentText
} from "@mui/material";

// Dialog for partial payment
export const PartialPaymentDialog = ({
  open,
  onClose,
  onSubmit,
  paymentData,
  partialAmount,
  setPartialAmount,
  partialNote,
  setPartialNote,
  loading
}) => {
  return (
    <Dialog open={open} onClose={onClose} dir="rtl">
      <DialogTitle>תשלום חלקי</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          סכום מלא: ₪{paymentData?.amount}
          {paymentData?.paidAmount > 0 && `, שולם עד כה: ₪${paymentData.paidAmount}`}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="סכום לתשלום"
          type="number"
          fullWidth
          variant="outlined"
          value={partialAmount}
          onChange={(e) => setPartialAmount(e.target.value)}
          inputProps={{ min: 1, max: paymentData?.amount - (paymentData?.paidAmount || 0) }}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="הערה (אופציונלי)"
          type="text"
          fullWidth
          variant="outlined"
          value={partialNote}
          onChange={(e) => setPartialNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          בטל
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained" 
          disabled={!partialAmount || partialAmount <= 0 || loading}
        >
          {loading ? <CircularProgress size={24} /> : "שלם"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialog for bulk payment
export const BulkPaymentDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
  unpaidAmount
}) => {
  return (
    <Dialog open={open} onClose={onClose} dir="rtl">
      <DialogTitle>תשלום כל החיובים</DialogTitle>
      <DialogContent>
        <DialogContentText>
          האם אתה בטוח שברצונך לשלם את כל החיובים הלא משולמים?
          סכום כולל לתשלום: ₪{unpaidAmount}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          בטל
        </Button>
        <Button 
          onClick={onSubmit} 
          color="success" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "אשר תשלום"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialog for bulk partial payment
export const BulkPartialPaymentDialog = ({
  open,
  onClose,
  onSubmit,
  amount,
  setAmount,
  note,
  setNote,
  loading,
  unpaidAmount
}) => {
  return (
    <Dialog open={open} onClose={onClose} dir="rtl">
      <DialogTitle>תשלום חלקי כולל</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          סכום כולל לא משולם: ₪{unpaidAmount}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="סכום לתשלום"
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 1, max: unpaidAmount }}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="הערה (אופציונלי)"
          type="text"
          fullWidth
          variant="outlined"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Typography variant="body2" color="text.secondary" mt={2}>
          התשלום יחולק לפי סדר כרונולוגי (החיוב הישן ביותר ישולם קודם)
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          בטל
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained" 
          disabled={!amount || amount <= 0 || loading}
        >
          {loading ? <CircularProgress size={24} /> : "שלם"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
