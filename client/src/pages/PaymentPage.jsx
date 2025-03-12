import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Paper,
  useTheme,
  Tabs,
  Tab
} from "@mui/material";
import { 
  Payment as PaymentIcon, 
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Services
import { 
  getUserAliyot, 
  updatePaymentStatus, 
  makePartialPayment 
} from "../services/api";

// Components
import PaymentStatistics from "../components/payment/PaymentStatistics";
import PaymentTable from "../components/payment/PaymentTable";
import { 
  PartialPaymentDialog, 
  BulkPaymentDialog, 
  BulkPartialPaymentDialog 
} from "../components/payment/PaymentDialogs";

const PaymentPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  // State variables
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    aliyotCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // State for partial payment dialog
  const [partialPaymentOpen, setPartialPaymentOpen] = useState(false);
  const [partialPaymentData, setPartialPaymentData] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [partialNote, setPartialNote] = useState('');
  
  // State for bulk payment dialog
  const [bulkPaymentOpen, setBulkPaymentOpen] = useState(false);
  const [bulkPartialPaymentOpen, setBulkPartialPaymentOpen] = useState(false);
  const [bulkPartialAmount, setBulkPartialAmount] = useState('');
  const [bulkPartialNote, setBulkPartialNote] = useState('');
  
  // Add a function to manually refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('משתמש לא מחובר');
        setPayments([]);
        return;
      }
      
      const data = await getUserAliyot(userId);
      
      // Make sure data exists and is an array
      if (!data || !Array.isArray(data)) {
        setPayments([]);
        setStatistics({
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          aliyotCount: 0
        });
        return;
      }
      
      // Make sure paidAmount has a valid value and calculate correctly
      const normalizedData = data.map(payment => {
        // Ensure paid amount is never negative
        const paidAmount = Math.max(0, payment.paidAmount || 0);
        // For fully paid debts, set paidAmount equal to amount to avoid discrepancies
        return {
          ...payment,
          paidAmount: payment.isPaid ? payment.amount : paidAmount
        };
      });
      
      setPayments(normalizedData);
      
      // Recalculate stats with precise calculations
      const stats = normalizedData.reduce((acc, payment) => {
        const paidAmount = payment.isPaid ? payment.amount : (payment.paidAmount || 0);
        const remainingAmount = Math.max(0, payment.amount - paidAmount);
        
        acc.totalAmount += payment.amount;
        acc.paidAmount += paidAmount;
        acc.unpaidAmount += remainingAmount;
        acc.aliyotCount++;
        
        return acc;
      }, {
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        aliyotCount: 0
      });
      
      setStatistics(stats);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('אירעה שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch when component mounts
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
        
        // Make sure data exists and is an array
        if (!data || !Array.isArray(data)) {
          setPayments([]);
          setStatistics({
            totalAmount: 0,
            paidAmount: 0,
            unpaidAmount: 0,
            aliyotCount: 0
          });
          return;
        }
        
        // Make sure paidAmount has a valid value
        const normalizedData = data.map(payment => ({
          ...payment,
          // For fully paid debts, set paidAmount equal to amount to avoid discrepancies
          paidAmount: payment.isPaid ? payment.amount : (payment.paidAmount || 0)
        }));
        
        setPayments(normalizedData);
        
        // Calculate statistics
        const stats = normalizedData.reduce((acc, payment) => {
          // For fully paid items, ensure paidAmount is exactly equal to amount
          const paidAmount = payment.isPaid ? payment.amount : (payment.paidAmount || 0);
          const remainingAmount = Math.max(0, payment.amount - paidAmount);
          
          acc.totalAmount += payment.amount;
          acc.paidAmount += paidAmount;
          acc.unpaidAmount += remainingAmount;
          acc.aliyotCount++;
          return acc;
        }, {
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          aliyotCount: 0
        });
        setStatistics(stats);
        setError('');
      } catch (error) {
        setError('אירעה שגיאה בטעינת הנתונים');
        console.error('Error:', error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAliyot();
  }, []);
  
  // Event handlers
  const handleOpenPartialPayment = (payment) => {
    setPartialPaymentData(payment);
    setPartialAmount('');
    setPartialNote('');
    setPartialPaymentOpen(true);
  };
  
  const handleClosePartialPayment = () => {
    setPartialPaymentOpen(false);
    setPartialPaymentData(null);
  };
  
  const handleOpenBulkPayment = () => {
    setBulkPaymentOpen(true);
  };
  
  const handleCloseBulkPayment = () => {
    setBulkPaymentOpen(false);
  };
  
  const handleOpenBulkPartialPayment = () => {
    setBulkPartialAmount('');
    setBulkPartialNote('');
    setBulkPartialPaymentOpen(true);
  };
  
  const handleCloseBulkPartialPayment = () => {
    setBulkPartialPaymentOpen(false);
  };

  // פונקציה לעדכון סטטוס תשלום - תשלום מלא
  const handlePaymentUpdate = async (paymentId) => {
    try {
      setUpdatingId(paymentId);
      await updatePaymentStatus(paymentId, true);
      
      // Use refresh function instead of manual update
      await refreshData();
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('אירעה שגיאה בעדכון התשלום');
    } finally {
      setUpdatingId(null);
    }
  };
  
  // פונקציה לביצוע תשלום חלקי
  const handleSubmitPartialPayment = async () => {
    try {
      setLoading(true);
      
      // ולידציה
      if (!partialPaymentData || !partialAmount || partialAmount <= 0) {
        setError('יש להזין סכום תקף');
        return;
      }
      
      const amount = parseFloat(partialAmount);
      
      // וידוא שלא משלמים יותר מהסכום שנותר
      const remainingAmount = partialPaymentData.amount - (partialPaymentData.paidAmount || 0);
      if (amount > remainingAmount) {
        setError('הסכום שהוזן גדול מהסכום שנותר לתשלום');
        return;
      }
      
      // ביצוע התשלום החלקי
      await makePartialPayment(
        partialPaymentData._id, 
        amount, 
        partialNote
      );
      
      // Use refresh function instead of manual update
      await refreshData();
      
      handleClosePartialPayment();
      
    } catch (error) {
      console.error('Error making partial payment:', error);
      setError('אירעה שגיאה בביצוע התשלום');
    } finally {
      setLoading(false);
    }
  };
  
  // פונקציה לביצוע תשלום מלא לכל החיובים
  const handleSubmitBulkPayment = async () => {
    try {
      setLoading(true);
      
      // Get all unpaid payments
      const unpaidPayments = payments.filter(payment => !payment.isPaid);
      
      if (unpaidPayments.length === 0) {
        setError('אין חיובים לתשלום');
        setBulkPaymentOpen(false);
        return;
      }
      
      // Process all payments in sequence
      for (const payment of unpaidPayments) {
        await updatePaymentStatus(payment._id, true);
      }
      
      // Refresh data with the new function instead of duplicate code
      await refreshData();
      setBulkPaymentOpen(false);
      
    } catch (error) {
      console.error('Error processing bulk payment:', error);
      setError('אירעה שגיאה בביצוע התשלומים');
    } finally {
      setLoading(false);
    }
  };
  
  // פונקציה לביצוע תשלום חלקי כולל
  const handleSubmitBulkPartialPayment = async () => {
    try {
      setLoading(true);
      
      // ולידציה
      if (!bulkPartialAmount || bulkPartialAmount <= 0) {
        setError('יש להזין סכום תקף');
        return;
      }
      
      const amount = parseFloat(bulkPartialAmount);
      
      // חישוב סך הכל לא משולם
      const totalUnpaid = payments.reduce((acc, payment) => {
        if (!payment.isPaid) {
          acc += payment.amount - (payment.paidAmount || 0);
        }
        return acc;
      }, 0);
      
      // וידוא שלא משלמים יותר מהסכום שנותר
      if (amount > totalUnpaid) {
        setError('הסכום שהוזן גדול מהסכום הכולל שנותר לתשלום');
        return;
      }
      
      // מיון החיובים לפי תאריך (הישן ביותר ראשון)
      const sortedUnpaidPayments = payments
        .filter(payment => !payment.isPaid)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // ביצוע תשלומים חלקיים לפי סדר
      let remainingAmount = amount;
      
      for (const payment of sortedUnpaidPayments) {
        if (remainingAmount <= 0) break;
        
        const unpaidForThisPayment = payment.amount - (payment.paidAmount || 0);
        const paymentAmount = Math.min(unpaidForThisPayment, remainingAmount);
        
        if (paymentAmount > 0) {
          await makePartialPayment(payment._id, paymentAmount, bulkPartialNote);
          remainingAmount -= paymentAmount;
        }
      }
      
      // Refresh data with the new function instead of duplicate code
      await refreshData();
      setBulkPartialPaymentOpen(false);
      
    } catch (error) {
      console.error('Error processing bulk partial payment:', error);
      setError('אירעה שגיאה בביצוע התשלום החלקי');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 800,
            color: theme.palette.primary.main,
            textAlign: 'center',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 35 }} />
          ניהול תשלומים
        </Typography>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                py: 2
              }
            }}
          >
            <Tab 
              label="תשלומים פעילים" 
              icon={<PaymentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="היסטוריית תשלומים" 
              icon={<HistoryIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Button
              variant="contained"
              onClick={handleOpenBulkPayment}
              startIcon={<PaymentIcon />}
              sx={{
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              תשלום מלא להכל
            </Button>
            
            <Button
              variant="contained"
              onClick={handleOpenBulkPartialPayment}
              startIcon={<PaymentIcon />}
              sx={{
                bgcolor: theme.palette.info.main,
                '&:hover': {
                  bgcolor: theme.palette.info.dark,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              תשלום חלקי להכל
            </Button>

            <Button
              variant="outlined"
              onClick={refreshData}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  bgcolor: 'rgba(37, 99, 235, 0.05)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              רענן נתונים
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Paper 
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: 2,
            color: '#DC2626',
            textAlign: 'center',
            fontWeight: 500
          }}
        >
          {error}
        </Paper>
      )}

      {activeTab === 0 ? (
        // תשלומים פעילים
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <PaymentStatistics statistics={statistics} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                overflow: 'hidden'
              }}
            >
              {loading ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 4
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <PaymentTable
                  payments={payments.filter(p => !p.isPaid)}
                  onPaymentUpdate={handlePaymentUpdate}
                  onPartialPayment={handleOpenPartialPayment}
                  updatingId={updatingId}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // היסטוריית תשלומים
        <Paper 
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 4
              }}
            >
              <CircularProgress size={40} />
            </Box>
          ) : (
            <PaymentTable
              payments={payments.filter(p => p.isPaid)}
              onPaymentUpdate={handlePaymentUpdate}
              onPartialPayment={handleOpenPartialPayment}
              updatingId={updatingId}
              isHistory={true}
            />
          )}
        </Paper>
      )}

      {/* Existing dialogs */}
      <PartialPaymentDialog
        open={partialPaymentOpen}
        onClose={handleClosePartialPayment}
        payment={partialPaymentData}
        amount={partialAmount}
        setAmount={setPartialAmount}
        note={partialNote}
        setNote={setPartialNote}
        onSubmit={handleSubmitPartialPayment}
        loading={loading}
      />

      <BulkPaymentDialog
        open={bulkPaymentOpen}
        onClose={handleCloseBulkPayment}
        onSubmit={handleSubmitBulkPayment}
        loading={loading}
      />

      <BulkPartialPaymentDialog
        open={bulkPartialPaymentOpen}
        onClose={handleCloseBulkPartialPayment}
        amount={bulkPartialAmount}
        setAmount={setBulkPartialAmount}
        note={bulkPartialNote}
        setNote={setBulkPartialNote}
        onSubmit={handleSubmitBulkPartialPayment}
        loading={loading}
      />
    </Container>
  );
};

export default PaymentPage;