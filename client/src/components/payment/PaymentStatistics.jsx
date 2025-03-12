import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const StatItem = ({ title, value, icon: Icon, color }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: `${color}15`,
        border: '1px solid',
        borderColor: `${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${color}20`
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          borderRadius: 1.5,
          bgcolor: color,
          color: '#fff'
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            mb: 0.5
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary
          }}
        >
          ₪{value.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

const PaymentStatistics = ({ statistics }) => {
  const theme = useTheme();
  
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        סטטיסטיקות תשלומים
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <StatItem
          title="סכום כולל"
          value={statistics.totalAmount || 0}
          icon={AccountBalanceIcon}
          color={theme.palette.primary.main}
        />
        
        <StatItem
          title="סכום ששולם"
          value={statistics.paidAmount || 0}
          icon={TrendingUpIcon}
          color={theme.palette.success.main}
        />
        
        <StatItem
          title="סכום שטרם שולם"
          value={statistics.unpaidAmount || 0}
          icon={TrendingDownIcon}
          color={theme.palette.error.main}
        />
      </Box>
    </Box>
  );
};

export default PaymentStatistics;
