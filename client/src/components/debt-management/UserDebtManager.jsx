import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Alert, 
  Button, 
  CircularProgress, 
  Fab, 
  ButtonGroup,
  Tooltip,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import { 
  getUserWithDebts, 
  updateDebtDetails, 
  updatePaymentStatus, 
  makePartialPayment,
  createAliya
} from '../../services/api';

// Import components
import UserInfoCard from './UserInfoCard';
import DebtStatisticsCard from './DebtStatisticsCard';
import DebtTable from './DebtTable';
import EditDebtDialog from './EditDebtDialog';
import PartialPaymentDialog from './PartialPaymentDialog';
import NewDebtDialog from './NewDebtDialog';
import BulkPaymentDialog from './BulkPaymentDialog';

/**
 * Main component for managing user debts
 * @param {string} userId - User ID
 * @param {Function} onClose - Function to handle close
 */
const UserDebtManager = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [debts, setDebts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    aliyotCount: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [activeDialog, setActiveDialog] = useState(null); // 'edit', 'partial', 'new', 'bulkPayment', or null
  const [currentDebt, setCurrentDebt] = useState(null);
  
  // Edit debt dialog state
  const [editedAmount, setEditedAmount] = useState('');
  const [editedParsha, setEditedParsha] = useState('');
  const [editedAliyaType, setEditedAliyaType] = useState('');

  // Partial payment dialog state
  const [partialAmount, setPartialAmount] = useState('');
  const [partialNote, setPartialNote] = useState('');
  
  // New debt dialog state
  const [newDebtData, setNewDebtData] = useState({
    amount: '',
    parsha: '',
    aliyaType: 'אחר',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Bulk payment dialog state
  const [bulkPaymentType, setBulkPaymentType] = useState('full'); // 'full' or 'partial'
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState('');
  const [bulkPaymentNote, setBulkPaymentNote] = useState('');

  // Safely set the active dialog - prevents multiple dialogs from being open
  const safeSetActiveDialog = useCallback((dialogType) => {
    // Close any existing dialog first
    setActiveDialog(null);
    
    // Use a small timeout to ensure that the previous dialog has had time to close
    setTimeout(() => {
      setActiveDialog(dialogType);
    }, 50);
  }, []);

  // Fetch user data and debts
  useEffect(() => {
    const fetchUserWithDebts = async () => {
      try {
        setLoading(true);
        const data = await getUserWithDebts(userId);
        setUserData(data.user);
        setDebts(data.debts);
        setStatistics(data.statistics);
        setError('');
      } catch (error) {
        setError(error.message || 'אירעה שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserWithDebts();
    }
  }, [userId]);

  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      console.log('Refreshing data for user:', userId);
      const data = await getUserWithDebts(userId);
      console.log('Refreshed data received:', data);
      
      // Update state with new data
      setUserData(data.user);
      setDebts(data.debts);
      setStatistics(data.statistics);
      setError('');
      
      console.log('State updated with refreshed data');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error.message || 'אירעה שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const handleEditDebt = (debt) => {
    if (activeDialog) {
      console.log('Dialog already open, not opening edit dialog');
      return; // If another dialog is open, don't open this one
    }
    
    setCurrentDebt(debt);
    setEditedAmount(debt.amount.toString());
    setEditedParsha(debt.parsha);
    setEditedAliyaType(debt.aliyaType);
    safeSetActiveDialog('edit');
  };

  // Save edited debt
  const handleSaveDebt = async () => {
    setLoading(true);
    setError('');
    
    try {
      const amount = parseFloat(editedAmount);
      
      if (isNaN(amount) || amount < 0) {
        setError('סכום לא תקין');
        return;
      }

      // Check if the new amount is greater than the paid amount
      const paidAmount = currentDebt.paidAmount || 0;
      const shouldUpdatePaymentStatus = amount > paidAmount;
      
      // Import and use debtService instead of direct api call
      const debtService = await import('../../services/debtService');
      
      // First update the debt details
      await debtService.updateDebtDetails(currentDebt._id, {
        amount,
        parsha: editedParsha,
        aliyaType: editedAliyaType
      });

      // If the new amount is greater than what was paid, mark as unpaid
      if (shouldUpdatePaymentStatus && currentDebt.isPaid) {
        await debtService.updatePaymentStatus(currentDebt._id, false);
      }
      
      setActiveDialog(null);
      await refreshData();
      setSnackbar({
        open: true,
        message: 'החוב עודכן בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating debt:', error);
      setError(error.message || 'אירעה שגיאה בעדכון החוב');
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה בעדכון החוב',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark debt as paid
  const handleMarkAsPaid = async (debtId) => {
    try {
      setLoading(true);
      
      // Import and use debtService
      const debtService = await import('../../services/debtService');
      await debtService.updatePaymentStatus(debtId, true);
      
      await refreshData();
      setSnackbar({
        open: true,
        message: 'החוב סומן כשולם בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error marking debt as paid:', error);
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה בסימון החוב כשולם',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open partial payment dialog
  const handlePartialPayment = (debt) => {
    if (activeDialog) {
      console.log('Dialog already open, not opening partial payment dialog');
      return; // If another dialog is open, don't open this one
    }
    
    setCurrentDebt(debt);
    setPartialAmount('');
    setPartialNote('');
    safeSetActiveDialog('partial');
  };

  // Save partial payment
  const handleSavePartialPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const amount = parseFloat(partialAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('סכום לא תקין');
        return;
      }
      
      // Import and use debtService
      const debtService = await import('../../services/debtService');
      await debtService.makePartialPayment(currentDebt._id, amount, partialNote || '');
      
      setActiveDialog(null);
      await refreshData();
      setSnackbar({
        open: true,
        message: 'התשלום החלקי נרשם בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error making partial payment:', error);
      setError(error.message || 'אירעה שגיאה ברישום התשלום החלקי');
    } finally {
      setLoading(false);
    }
  };

  // Open new debt dialog
  const handleNewDebt = useCallback(() => {
    if (activeDialog) {
      console.log('Dialog already open, not opening new debt dialog');
      return; // If another dialog is open, don't open this one
    }
    
    setNewDebtData({
      amount: '',
      parsha: '',
      aliyaType: 'אחר',
      date: new Date().toISOString().split('T')[0]
    });
    safeSetActiveDialog('new');
  }, [activeDialog, safeSetActiveDialog]);

  // Open bulk payment dialog
  const handleBulkPayment = useCallback((type) => {
    if (activeDialog) {
      console.log('Dialog already open, not opening bulk payment dialog');
      return; // If another dialog is open, don't open this one
    }
    
    setBulkPaymentType(type);
    setBulkPaymentAmount('');
    setBulkPaymentNote('');
    safeSetActiveDialog('bulkPayment');
  }, [activeDialog, safeSetActiveDialog]);

  // Save new debt
  const handleSaveNewDebt = async () => {
    try {
      setLoading(true);
      const amount = parseFloat(newDebtData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('סכום לא תקין');
        return;
      }
      
      await createAliya(userId, {
        amount,
        parsha: newDebtData.parsha,
        aliyaType: newDebtData.aliyaType,
        date: newDebtData.date,
        isPaid: false
      });
      
      setActiveDialog(null);
      await refreshData();
      setSnackbar({
        open: true,
        message: 'החוב נוסף בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding new debt:', error);
      setError(error.message || 'אירעה שגיאה בהוספת החוב חדש');
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה בהוספת החוב חדש',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix the bulk payment function
  const handleSaveBulkPayment = async () => {
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('אין הרשאה. נא להתחבר מחדש');
        setLoading(false);
        return;
      }
      
      if (bulkPaymentType === 'full') {
        // Pay all unpaid debts
        const unpaidDebts = debts.filter(debt => !debt.isPaid);
        for (const debt of unpaidDebts) {
          await updatePaymentStatus(debt._id, true);
        }
      } else {
        // Partial bulk payment
        const amount = parseFloat(bulkPaymentAmount);
        
        if (isNaN(amount) || amount <= 0) {
          setError('סכום לא תקין');
          return;
        }
        
        // Sort debts by date (oldest first)
        const unpaidDebts = debts
          .filter(debt => !debt.isPaid)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let remainingAmount = amount;
        
        for (const debt of unpaidDebts) {
          if (remainingAmount <= 0) break;
          
          const unpaidAmount = debt.amount - (debt.paidAmount || 0);
          
          if (unpaidAmount <= 0) continue;
          
          const paymentAmount = Math.min(remainingAmount, unpaidAmount);
          
          // Try using the API function first
          try {
            await makePartialPayment(debt._id, paymentAmount, bulkPaymentNote);
          } catch (apiError) {
            console.error('API bulk payment failed:', apiError);
            
            // If API call fails, try direct fetch as fallback
            const response = await fetch(`http://127.0.0.1:3002/aliyot/payment/${debt._id}/partial`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                amount: paymentAmount,
                note: bulkPaymentNote || ''
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Payment failed with status: ${response.status}`);
            }
          }
          
          remainingAmount -= paymentAmount;
        }
      }
      
      setActiveDialog(null);
      await refreshData();
      setSnackbar({
        open: true,
        message: 'התשלום המרוכז בוצע בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Bulk payment failed:', error);
      setError(error.message || 'אירעה שגיאה בביצוע תשלום מרוכז');
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה בביצוע תשלום מרוכז',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close any active dialog
  const handleCloseDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate if there are any unpaid debts
  const hasUnpaidDebts = debts.some(debt => !debt.isPaid);

  // New function to handle debt updated
  const handleDebtUpdated = async (debtId, action) => {
    console.log(`Debt ${action} triggered for ID: ${debtId}`);
    try {
      setLoading(true);
      // Refresh data from server
      await refreshData();
      console.log('Data refreshed after debt update');
    } catch (error) {
      console.error(`Error after debt ${action}:`, error);
      setError(error.message || `אירעה שגיאה לאחר ${action === 'delete' ? 'מחיקת' : 'עדכון'} החוב`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {userData && (
        <>
          <UserInfoCard userData={userData} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <h2>רשימת חובות</h2>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {hasUnpaidDebts && (
                <ButtonGroup 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  disabled={!!activeDialog} // Disable if any dialog is open
                >
                  <Tooltip title="תשלום מלא לכל החובות">
                    <Button
                      onClick={() => handleBulkPayment('full')}
                      startIcon={<PaymentIcon />}
                      disabled={!!activeDialog} // Double check to disable if any dialog is open
                    >
                      שלם הכל
                    </Button>
                  </Tooltip>
                  <Tooltip title="תשלום חלקי לכל החובות">
                    <Button
                      onClick={() => handleBulkPayment('partial')}
                      disabled={!!activeDialog} // Double check to disable if any dialog is open
                    >
                      תשלום חלקי
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              )}
              <Tooltip title="הוסף עלייה חדשה">
                <span> {/* Wrap Fab in span to prevent Tooltip warning with disabled elements */}
                  <Fab 
                    color="primary" 
                    size="small" 
                    onClick={handleNewDebt}
                    disabled={!!activeDialog} // Disable if any dialog is open
                  >
                    <AddIcon />
                  </Fab>
                </span>
              </Tooltip>
            </Box>
          </Box>
          
          <DebtTable 
            debts={debts}
            loading={loading}
            onEditDebt={activeDialog ? null : handleEditDebt}
            onMarkAsPaid={activeDialog ? null : handleMarkAsPaid}
            onPartialPayment={activeDialog ? null : handlePartialPayment}
            disableActions={!!activeDialog} // Disable actions if any dialog is open
            onDebtUpdated={handleDebtUpdated}
          />
          
          <DebtStatisticsCard statistics={statistics} />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onClose}
              disabled={!!activeDialog} // Disable if any dialog is open to prevent closing the main dialog
            >
              סגור
            </Button>
          </Box>
          
          {/* Dialogs */}
          <EditDebtDialog 
            open={activeDialog === 'edit'}
            onClose={handleCloseDialog}
            amount={editedAmount}
            onAmountChange={(e) => setEditedAmount(e.target.value)}
            parsha={editedParsha}
            onParshaChange={(e) => setEditedParsha(e.target.value)}
            aliyaType={editedAliyaType}
            onAliyaTypeChange={(e) => setEditedAliyaType(e.target.value)}
            onSave={handleSaveDebt}
            disableRestoreFocus
            disableEnforceFocus
          />
          
          <PartialPaymentDialog 
            open={activeDialog === 'partial'}
            onClose={handleCloseDialog}
            debt={currentDebt}
            amount={partialAmount}
            onAmountChange={(e) => setPartialAmount(e.target.value)}
            note={partialNote}
            onNoteChange={(e) => setPartialNote(e.target.value)}
            onSave={handleSavePartialPayment}
            disableRestoreFocus
            disableEnforceFocus
          />
          
          <NewDebtDialog
            open={activeDialog === 'new'}
            onClose={handleCloseDialog}
            debtData={newDebtData}
            onDebtDataChange={(field, value) => {
              setNewDebtData(prev => ({ ...prev, [field]: value }));
            }}
            onSave={handleSaveNewDebt}
            disableRestoreFocus
            disableEnforceFocus
          />
          
          <BulkPaymentDialog
            open={activeDialog === 'bulkPayment'}
            onClose={handleCloseDialog}
            paymentType={bulkPaymentType}
            amount={bulkPaymentAmount}
            onAmountChange={(e) => setBulkPaymentAmount(e.target.value)}
            note={bulkPaymentNote}
            onNoteChange={(e) => setBulkPaymentNote(e.target.value)}
            totalUnpaid={statistics.unpaidAmount}
            onSave={handleSaveBulkPayment}
            disabled={bulkPaymentType === 'partial' && (!bulkPaymentAmount || parseFloat(bulkPaymentAmount) <= 0)}
            disableRestoreFocus
            disableEnforceFocus
          />
        </>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDebtManager;
