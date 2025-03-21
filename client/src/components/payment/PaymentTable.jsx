import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  useTheme,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const PaymentTable = ({ 
  payments, 
  onPaymentUpdate, 
  onPartialPayment, 
  updatingId,
  isHistory = false 
}) => {
  const theme = useTheme();

  const getStatusColor = (isPaid) => {
    return isPaid ? theme.palette.success.main : theme.palette.warning.main;
  };

  const getStatusIcon = (isPaid) => {
    return isPaid ? <CheckCircleIcon /> : <WarningIcon />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {isHistory ? (
          <>
            <CalendarIcon sx={{ fontSize: 24 }} />
            היסטוריית תשלומים
          </>
        ) : (
          <>
            <PaymentIcon sx={{ fontSize: 24 }} />
            תשלומים פעילים
          </>
        )}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.background.default,
                '& th': {
                  fontWeight: 700,
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                  py: 1.5
                }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 20 }} />
                  תאריך
                </Box>
              </TableCell>
              <TableCell>סוג עלייה</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon sx={{ fontSize: 20 }} />
                  סכום
                </Box>
              </TableCell>
              <TableCell>סטטוס</TableCell>
              {!isHistory && <TableCell>פעולות</TableCell>}
              {isHistory && <TableCell>תאריך תשלום</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={isHistory ? 5 : 5} 
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {isHistory ? 'אין היסטוריית תשלומים' : 'אין תשלומים פעילים'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow
                  key={payment._id}
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(payment.date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {payment.aliyaType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: theme.palette.text.primary }}
                    >
                      ₪{payment.amount.toLocaleString()}
                    </Typography>
                    {payment.paidAmount > 0 && payment.paidAmount < payment.amount && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: theme.palette.info.main,
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        שולם: ₪{payment.paidAmount.toLocaleString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payment.isPaid)}
                      label={payment.isPaid ? 'שולם' : 'לא שולם'}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(payment.isPaid)}15`,
                        color: getStatusColor(payment.isPaid),
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        }
                      }}
                    />
                  </TableCell>
                  {!isHistory ? (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!payment.isPaid && (
                          <>
                            <Tooltip title="תשלום מלא">
                              <IconButton
                                size="small"
                                onClick={() => onPaymentUpdate(payment._id)}
                                disabled={updatingId === payment._id}
                                sx={{
                                  color: theme.palette.success.main,
                                  '&:hover': {
                                    bgcolor: `${theme.palette.success.main}15`
                                  }
                                }}
                              >
                                {updatingId === payment._id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  <PaymentIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="תשלום חלקי">
                              <IconButton
                                size="small"
                                onClick={() => onPartialPayment(payment)}
                                disabled={updatingId === payment._id}
                                sx={{
                                  color: theme.palette.info.main,
                                  '&:hover': {
                                    bgcolor: `${theme.palette.info.main}15`
                                  }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Typography variant="body2">
                        {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaymentTable;
