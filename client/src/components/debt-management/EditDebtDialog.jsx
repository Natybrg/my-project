import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

/**
 * Component for editing debt details
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Function to handle dialog close
 * @param {string} amount - Debt amount
 * @param {Function} onAmountChange - Function to handle amount change
 * @param {string} parsha - Parsha name
 * @param {Function} onParshaChange - Function to handle parsha change
 * @param {string} aliyaType - Aliya type
 * @param {Function} onAliyaTypeChange - Function to handle aliya type change
 * @param {Function} onSave - Function to handle save
 */
const EditDebtDialog = ({
  open,
  onClose,
  amount,
  onAmountChange,
  parsha,
  onParshaChange,
  aliyaType,
  onAliyaTypeChange,
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
      <DialogTitle>עריכת חוב</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="סכום"
          type="number"
          fullWidth
          value={amount}
          onChange={onAmountChange}
          inputProps={{ min: 0 }}
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          margin="dense"
          label="פרשה"
          type="text"
          fullWidth
          value={parsha}
          onChange={onParshaChange}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>סוג עלייה</InputLabel>
          <Select
            value={aliyaType}
            label="סוג עלייה"
            onChange={onAliyaTypeChange}
          >
            <MenuItem value="כהן">כהן</MenuItem>
            <MenuItem value="לוי">לוי</MenuItem>
            <MenuItem value="שלישי">שלישי</MenuItem>
            <MenuItem value="רביעי">רביעי</MenuItem>
            <MenuItem value="חמישי">חמישי</MenuItem>
            <MenuItem value="שישי">שישי</MenuItem>
            <MenuItem value="שביעי">שביעי</MenuItem>
            <MenuItem value="מפטיר">מפטיר</MenuItem>
            <MenuItem value="הגבהה">הגבהה</MenuItem>
            <MenuItem value="גלילה">גלילה</MenuItem>
            <MenuItem value="פתיחה">פתיחה</MenuItem>
            <MenuItem value="הוצאה והכנסה">הוצאה והכנסה</MenuItem>
            <MenuItem value="אחר">אחר</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={onSave} color="primary">
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDebtDialog;
