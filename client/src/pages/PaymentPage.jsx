import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress
} from "@mui/material";

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
  
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" component="h1" align="center" mb={2}>
        העליות שלי
      </Typography>
      
      {error && (
        <Typography color="error" align="center" mb={2}>
          {error}
        </Typography>
      )}
      
      {/* Add refresh button */}
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={refreshData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          size="small"
        >
          רענן נתונים
        </Button>
      </Box>
      
      {loading && !updatingId ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {/* תצוגת סטטיסטיקות */}
            <Grid item xs={12} md={4}>
              <PaymentStatistics 
                statistics={statistics}
                onOpenBulkPayment={handleOpenBulkPayment}
                onOpenBulkPartialPayment={handleOpenBulkPartialPayment}
                loading={loading}
              />
            </Grid>
            
            {/* טבלת תשלומים */}
            <Grid item xs={12} md={8}>
              <PaymentTable 
                payments={payments}
                updatingId={updatingId}
                onPaymentUpdate={handlePaymentUpdate}
                onOpenPartialPayment={handleOpenPartialPayment}
              />
            </Grid>
          </Grid>
          
          {/* דיאלוג תשלום חלקי */}
          <PartialPaymentDialog 
            open={partialPaymentOpen}
            onClose={handleClosePartialPayment}
            onSubmit={handleSubmitPartialPayment}
            paymentData={partialPaymentData}
            partialAmount={partialAmount}
            setPartialAmount={setPartialAmount}
            partialNote={partialNote}
            setPartialNote={setPartialNote}
            loading={loading}
          />
          
          {/* דיאלוג תשלום מלא לכל החיובים */}
          <BulkPaymentDialog 
            open={bulkPaymentOpen}
            onClose={handleCloseBulkPayment}
            onSubmit={handleSubmitBulkPayment}
            loading={loading}
            unpaidAmount={statistics.unpaidAmount}
          />
          
          {/* דיאלוג תשלום חלקי כולל */}
          <BulkPartialPaymentDialog 
            open={bulkPartialPaymentOpen}
            onClose={handleCloseBulkPartialPayment}
            onSubmit={handleSubmitBulkPartialPayment}
            amount={bulkPartialAmount}
            setAmount={setBulkPartialAmount}
            note={bulkPartialNote}
            setNote={setBulkPartialNote}
            loading={loading}
            unpaidAmount={statistics.unpaidAmount}
          />
        </>
      )}
    </Container>
  );
};

export default PaymentPage;