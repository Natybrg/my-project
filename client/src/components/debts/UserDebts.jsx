import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

const UserDebts = ({ debts = [], onNavigateToPayment }) => {
  const theme = useTheme();

  // חישוב סכום כולל וסכום ששולם
  const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const paidAmount = debts.reduce((sum, debt) => sum + (debt.paidAmount || 0), 0);
  const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        mb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div" fontWeight={600}>
            מצב חובות
          </Typography>
        </Box>
        {totalAmount > 0 && (
          <Chip
            label={`${progress.toFixed(0)}% שולם`}
            color={progress === 100 ? 'success' : 'primary'}
            size="small"
            sx={{
              fontWeight: 500,
              bgcolor: progress === 100 ? theme.palette.success.light : theme.palette.primary.light,
              color: '#fff'
            }}
          />
        )}
      </Box>

      {totalAmount > 0 && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: progress === 100 ? theme.palette.success.main : theme.palette.primary.main
              }
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 1,
            px: 0.5
          }}>
            <Typography variant="caption" color="text.secondary">
              סה"כ: ₪{totalAmount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              שולם: ₪{paidAmount.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mr: -1,
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.1,
            borderRadius: '3px',
          },
        }}
      >
        <List sx={{ py: 0 }}>
          {debts.length > 0 ? (
            debts.map((debt) => (
              <ListItem
                key={debt.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'background.default',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.main}10`,
                    transform: 'translateX(-4px)'
                  }
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onNavigateToPayment?.(debt)}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaymentIcon 
                        sx={{ 
                          fontSize: 20,
                          color: debt.paidAmount >= debt.amount ? theme.palette.success.main : theme.palette.warning.main
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight={500}>
                        {debt.title || 'חוב'}
                      </Typography>
                      <Chip
                        label={debt.paidAmount >= debt.amount ? 'שולם' : 'לא שולם'}
                        size="small"
                        color={debt.paidAmount >= debt.amount ? 'success' : 'warning'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        סכום: ₪{debt.amount.toLocaleString()}
                      </Typography>
                      {debt.paidAmount > 0 && debt.paidAmount < debt.amount && (
                        <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                          שולם: ₪{debt.paidAmount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box
              sx={{
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography>אין חובות</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default UserDebts; 