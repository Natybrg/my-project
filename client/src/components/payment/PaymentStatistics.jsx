import React from "react";
import {
  Typography,
  Box,
  Divider,
  Paper,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const PaymentStatistics = ({ 
  statistics, 
  onOpenBulkPayment, 
  onOpenBulkPartialPayment, 
  loading 
}) => {
  // נתונים לתרשים עוגה
  const pieData = [
    { name: 'שולם', value: statistics.paidAmount },
    { name: 'לא שולם', value: statistics.unpaidAmount }
  ];
  
  const COLORS = ['#4caf50', '#f44336'];

  // Custom render for the pie chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    // Only show label if the segment is significant (more than 5%)
    if (percent < 0.05) return null;
    
    // Calculate position for the text
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend that formats the values
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 1 }}>
        {payload.map((entry, index) => {
          // Calculate proportion for percentage
          const total = statistics.paidAmount + statistics.unpaidAmount;
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          
          return (
            <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: entry.color,
                  marginRight: 1,
                  borderRadius: '2px'
                }}
              />
              <Typography variant="body2" fontWeight={entry.name === 'שולם' ? 'bold' : 'normal'}>
                {entry.name}: {percentage}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, height: '100%', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        סטטיסטיקות
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          סה"כ עליות: <strong>{statistics.aliyotCount}</strong>
        </Typography>
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          סה"כ סכום: <strong>₪{statistics.totalAmount}</strong>
        </Typography>
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          שולם: <strong style={{ color: '#4caf50' }}>₪{statistics.paidAmount}</strong>
        </Typography>
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          נותר לתשלום: <strong style={{ color: '#f44336' }}>₪{statistics.unpaidAmount}</strong>
        </Typography>
      </Box>
      
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={0}
            labelLine={false}
            label={renderCustomizedLabel}
            paddingAngle={2}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₪${value}`} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* כפתורים לתשלום גלובלי */}
      {statistics.unpaidAmount > 0 && (
        <Box mt={1}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            אפשרויות תשלום כולל
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="success"
              onClick={onOpenBulkPayment}
              fullWidth
              disabled={loading}
              size="small"
            >
              שלם את כל החיובים
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={onOpenBulkPartialPayment}
              fullWidth
              disabled={loading}
              size="small"
            >
              תשלום חלקי כולל
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default PaymentStatistics;
