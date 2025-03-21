import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Button,
  useTheme,
  Stack,
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const UserDebts = ({ 
  totalDebt = 1000,
  paidAmount = 400,
  onNavigateToPayment
}) => {
  const theme = useTheme();
  const progress = (paidAmount / totalDebt) * 100;

  return (
    <Paper
      elevation={0}
      sx={{
        height: 200,
        width: '100%',
        p: 2,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h6" component="div" fontWeight={700}>
            מצב חובות
          </Typography>
        </Box>
        {progress < 100 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PaymentIcon />}
            onClick={onNavigateToPayment}
            sx={{ minWidth: 'auto' }}
          >
            לתשלום
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          {/* Progress Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                סה"כ שולם
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                ₪{paidAmount.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                סה"כ לתשלום
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                ₪{totalDebt.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: progress >= 100 ? theme.palette.success.main : theme.palette.primary.main
                }
              }}
            />
          </Box>

          {/* Status Chip */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={progress >= 100 ? 'שולם במלואו' : `נותר לתשלום: ₪${(totalDebt - paidAmount).toLocaleString()}`}
              color={progress >= 100 ? 'success' : 'primary'}
              variant="outlined"
              size="small"
            />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default UserDebts; 