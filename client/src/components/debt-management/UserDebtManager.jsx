import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Alert, 
  Button, 
  CircularProgress, 
  Fab, 
  ButtonGroup,
  Tooltip
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
    try {
      setLoading(true);
      const amount = parseFloat(editedAmount);
      
      if (isNaN(amount) || amount < 0) {
        setError('סכום לא תקין');
        return;
      }
      
      await updateDebtDetails(currentDebt._id, {
        amount,
        parsha: editedParsha,
        aliyaType: editedAliyaType
      });
      
      setActiveDialog(null);
      await refreshData();
    } catch (error) {
      setError(error.message || 'אירעה שגיאה בעדכון החוב');
    } finally {
      setLoading(false);
    }
  };

  // Mark debt as paid
  const handleMarkAsPaid = async (debtId) => {
    try {
      setLoading(true);
      await updatePaymentStatus(debtId, true);
      await refreshData();
    } catch (error) {
      setError(error.message || 'אירעה שגיאה בעדכון התשלום');
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
    try {
      setLoading(true);
      const amount = parseFloat(partialAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('סכום לא תקין');
        return;
      }
      
      await makePartialPayment(currentDebt._id, amount, partialNote);
      
      setActiveDialog(null);
      await refreshData();
    } catch (error) {
      setError(error.message || 'אירעה שגיאה בביצוע התשלום החלקי');
    } finally {
      setLoading(false);
    }
  };
  
  // Open new debt dialog
  const handleNewDebt = () => {
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
  };
  
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
    } catch (error) {
      setError(error.message || 'אירעה שגיאה בהוספת החוב החדש');
    } finally {
      setLoading(false);
    }
  };
  
  // Open bulk payment dialog
  const handleBulkPayment = (type) => {
    if (activeDialog) {
      console.log('Dialog already open, not opening bulk payment dialog');
      return; // If another dialog is open, don't open this one
    }
    
    setBulkPaymentType(type);
    setBulkPaymentAmount(type === 'full' ? statistics.unpaidAmount.toString() : '');
    setBulkPaymentNote('');
    safeSetActiveDialog('bulkPayment');
  };
  
  // Save bulk payment
  const handleSaveBulkPayment = async () => {
    try {
      setLoading(true);
      
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
          await makePartialPayment(debt._id, paymentAmount, bulkPaymentNote);
          
          remainingAmount -= paymentAmount;
        }
      }
      
      setActiveDialog(null);
      await refreshData();
    } catch (error) {
      setError(error.message || 'אירעה שגיאה בביצוע תשלום מרוכז');
    } finally {
      setLoading(false);
    }
  };

  // Close any active dialog
  const handleCloseDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  // Calculate if there are any unpaid debts
  const hasUnpaidDebts = debts.some(debt => !debt.isPaid);

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
          />
          
          <NewDebtDialog
            open={activeDialog === 'new'}
            onClose={handleCloseDialog}
            debtData={newDebtData}
            onDebtDataChange={(field, value) => {
              setNewDebtData(prev => ({ ...prev, [field]: value }));
            }}
            onSave={handleSaveNewDebt}
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
          />
        </>
      )}
    </Box>
  );
};

export default UserDebtManager;
