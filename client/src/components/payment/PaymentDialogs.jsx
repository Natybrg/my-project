import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  useTheme,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Dialog for partial payment
export const PartialPaymentDialog = ({
  open,
  onClose,
  payment,
  amount,
  setAmount,
  note,
  setNote,
  onSubmit,
  loading
}) => {
  const theme = useTheme();
  const remainingAmount = payment ? payment.amount - (payment.paidAmount || 0) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          תשלום חלקי
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            פרטי התשלום
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: theme.palette.background.default,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              סוג עלייה: <strong>{payment?.aliyaType}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              סכום כולל: <strong>₪{payment?.amount?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              שולם עד כה: <strong>₪{payment?.paidAmount?.toLocaleString() || 0}</strong>
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={600}>
              נותר לתשלום: ₪{remainingAmount?.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="סכום לתשלום"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          inputProps={{ min: 0, max: remainingAmount }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="הערות"
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main
              }
            }
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !amount || amount <= 0 || amount > remainingAmount}
          sx={{
            borderRadius: 1,
            px: 3,
            bgcolor: theme.palette.success.main,
            '&:hover': {
              bgcolor: theme.palette.success.dark
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'אישור תשלום'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialog for bulk payment
export const BulkPaymentDialog = ({ open, onClose, onSubmit, loading }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          תשלום מלא לכל החיובים
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          האם אתה בטוח שברצונך לשלם את כל החיובים שטרם שולמו?
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            bgcolor: theme.palette.success.main,
            '&:hover': {
              bgcolor: theme.palette.success.dark
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'אישור תשלום'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialog for bulk partial payment
export const BulkPartialPaymentDialog = ({
  open,
  onClose,
  amount,
  setAmount,
  note,
  setNote,
  onSubmit,
  loading
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          תשלום חלקי לכל החיובים
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="סכום לתשלום"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          inputProps={{ min: 0 }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="הערות"
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main
              }
            }
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !amount || amount <= 0}
          sx={{
            borderRadius: 1,
            px: 3,
            bgcolor: theme.palette.success.main,
            '&:hover': {
              bgcolor: theme.palette.success.dark
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'אישור תשלום'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default {
  PartialPaymentDialog,
  BulkPaymentDialog,
  BulkPartialPaymentDialog
};
