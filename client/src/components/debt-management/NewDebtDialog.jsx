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
  MenuItem,
  Box,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Component for adding a new debt 
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Function to handle dialog close
 * @param {Object} debtData - New debt data
 * @param {Function} onDebtDataChange - Function to handle debt data change
 * @param {Function} onSave - Function to handle save
 */
const NewDebtDialog = ({
  open,
  onClose,
  debtData,
  onDebtDataChange,
  onSave
}) => {
  const handleChange = (field) => (event) => {
    onDebtDataChange(field, event.target.value);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
      BackdropProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          הוספת חוב חדש
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              label="סכום"
              type="number"
              fullWidth
              value={debtData.amount}
              onChange={handleChange('amount')}
              inputProps={{ min: 0 }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="פרשה"
              type="text"
              fullWidth
              value={debtData.parsha}
              onChange={handleChange('parsha')}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>סוג עלייה</InputLabel>
              <Select
                value={debtData.aliyaType}
                label="סוג עלייה"
                onChange={handleChange('aliyaType')}
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
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="תאריך"
              type="date"
              fullWidth
              value={debtData.date}
              onChange={handleChange('date')}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        mt: 1 
      }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          variant="outlined"
          size="small"
        >
          ביטול
        </Button>
        <Button 
          onClick={onSave} 
          color="primary" 
          variant="contained"
          size="small"
          disabled={!debtData.amount || !debtData.parsha}
        >
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewDebtDialog;
