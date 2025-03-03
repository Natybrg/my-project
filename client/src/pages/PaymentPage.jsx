import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { getUserAliyot, updatePaymentStatus } from "../services/api";

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    aliyotCount: 0
  });
  
  useEffect(() => {
    // פונקציה לחישוב סטטיסטיקות
    const calculateStatistics = (data) => {
      const stats = data.reduce((acc, payment) => {
        acc.totalAmount += payment.amount;
        if (payment.isPaid) {
          acc.paidAmount += payment.amount;
        } else {
          acc.unpaidAmount += payment.amount;
        }
        acc.aliyotCount++;
        return acc;
      }, {
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        aliyotCount: 0
      });
      setStatistics(stats);
    };
    
    // פונקציה לטעינת הנתונים
    const fetchAliyot = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('משתמש לא מחובר');
          setPayments([]);
          return;
        }
        const data = await getUserAliyot(userId);
        setPayments(data);
        calculateStatistics(data);
        setError('');
      } catch (error) {
        setError('אירעה שגיאה בטעינת הנתונים');
        console.error('Error:', error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    
    // האזנה לשינויים במשתמש
    const handleUserChange = () => {
      fetchAliyot();
    };
    
    window.addEventListener('userChange', handleUserChange);
    fetchAliyot();
    
    // ניקוי בעת פירוק הקומפוננטה
    return () => {
      window.removeEventListener('userChange', handleUserChange);
    };
  }, []);

  // פונקציה לעדכון סטטוס תשלום
  const handlePaymentUpdate = async (paymentId) => {
    try {
      setUpdatingId(paymentId);
      await updatePaymentStatus(paymentId, true);
      
      // עדכון מקומי של הנתונים
      const updatedPayments = payments.map(payment => 
        payment._id === paymentId ? { ...payment, isPaid: true } : payment
      );
      
      setPayments(updatedPayments);
      
      // עדכון הסטטיסטיקות
      const paymentAmount = payments.find(p => p._id === paymentId)?.amount || 0;
      setStatistics(prev => ({
        ...prev,
        paidAmount: prev.paidAmount + paymentAmount,
        unpaidAmount: prev.unpaidAmount - paymentAmount
      }));
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('אירעה שגיאה בעדכון התשלום');
    } finally {
      setUpdatingId(null);
    }
  };
  
  // נתונים לתרשים עוגה
  const pieData = [
    { name: 'שולם', value: statistics.paidAmount },
    { name: 'לא שולם', value: statistics.unpaidAmount }
  ];
  
  const COLORS = ['#4caf50', '#f44336'];
  
  if (error && !payments.length) {
    return (
      <Typography color="error" align="center" mt={3}>
        {error}
      </Typography>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" align="center" mb={4}>
        העליות שלי
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* סטטיסטיקות בצד ימין */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                סטטיסטיקות
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  סה"כ עליות: <strong>{statistics.aliyotCount}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  סה"כ סכום: <strong>₪{statistics.totalAmount}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  שולם: <strong style={{ color: '#4caf50' }}>₪{statistics.paidAmount}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  נותר לתשלום: <strong style={{ color: '#f44336' }}>₪{statistics.unpaidAmount}</strong>
                </Typography>
              </Box>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* טבלת עליות בצד שמאל */}
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>תאריך</TableCell>
                    <TableCell>פרשה</TableCell>
                    <TableCell>סוג עלייה</TableCell>
                    <TableCell>סכום</TableCell>
                    <TableCell>סטטוס</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>{new Date(payment.date).toLocaleDateString('he-IL')}</TableCell>
                      <TableCell>{payment.parsha}</TableCell>
                      <TableCell>{payment.aliyaType}</TableCell>
                      <TableCell>₪{payment.amount}</TableCell>
                      <TableCell>
                        {payment.isPaid ? (
                          <Chip 
                            label="שולם"
                            color="success"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <Chip 
                            label={updatingId === payment._id ? "מעדכן..." : "לא שולם"}
                            color="error"
                            onClick={() => handlePaymentUpdate(payment._id)}
                            disabled={updatingId === payment._id}
                            sx={{ 
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.9 }
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        אין עליות להצגה
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default PaymentPage;