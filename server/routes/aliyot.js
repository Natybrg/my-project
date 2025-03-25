const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Debt = require('../models/Debt');
const { auth, isAdmin } = require('../middleware/auth');
const { verifyGabay, verifyUser } = require('../middleware/loginMiddelwares');
const jwt = require('jsonwebtoken');

// Add Aliyah to user
router.post('/addAliyah', auth, async (req, res) => {
  try {
      const { userId, parsha, aliyaType, amount, isPaid } = req.body;

      if (!userId || !parsha || !aliyaType || amount === undefined || isPaid === undefined) {
          return res.status(400).json({ message: 'Missing required fields' });
      }
      if (isNaN(amount) || amount < 0) {
          return res.status(400).json({ message: 'Invalid amount' });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: 'Invalid userId' });
      }
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const aliyah = new Debt({ 
          userId, 
          parsha, 
          aliyaType, 
          amount, 
          isPaid,
          paidAmount: isPaid ? amount : 0,
          paymentHistory: isPaid ? [{ amount, note: 'תשלום מלא בעת יצירה' }] : []
      });
      await aliyah.save();

      user.debts.push(aliyah._id);
      await user.save();

      const populatedUser = await User.findById(userId).populate('debts');
      res.status(201).json({ message: 'Aliyah added successfully', user: populatedUser });
  } catch (error) {
      console.error('Error adding aliyah:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get user's aliyot
router.get('/:userId/aliyot', auth, async (req, res) => {
  try {
      const { userId } = req.params;
      
      // Using req.user from auth middleware instead of duplicating token verification
      if (!req.user) {
        return res.status(401).json({ message: 'אין הרשאה לפעולה זו' });
      }
      
      // בודק אם המשתמש מנסה לצפות בנתונים של עצמו או שיש לו הרשאות מיוחדות
      const isOwnUser = req.user.id === userId;
      const isAdmin = ['admin', 'gabai', 'manager'].includes(req.user.rols);
      
      if (!isOwnUser && !isAdmin) {
        return res.status(403).json({ message: 'אין לך הרשאה לצפות בנתונים של משתמש אחר' });
      }

      const user = await User.findById(userId).populate('debts');
      if (!user) {
        return res.status(404).json({ message: 'משתמש לא נמצא' });
      }

      res.json(user.debts || []);
  } catch (error) {
      console.error('Error getting user aliyot:', error);
      res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Update payment status (full payment)
router.put('/payment/:paymentId', auth, async (req, res) => {
  try {
      const { paymentId } = req.params;
      const { isPaid } = req.body;
      
      console.log(`Received request to update payment status for ID: ${paymentId}, isPaid: ${isPaid}`);
      console.log(`User making request: ${req.user.id}, role: ${req.user.rols || req.user.role}`);

      if (typeof isPaid !== 'boolean') {
          return res.status(400).json({ message: 'Invalid isPaid value' });
      }

      const debt = await Debt.findById(paymentId);
      if (!debt) {
          console.log(`Payment not found with ID: ${paymentId}`);
          return res.status(404).json({ message: 'Payment not found' });
      }

      // Allow the user who owns the debt or users with admin/gabai/manager roles
      const isOwner = debt.userId.toString() === req.user.id;
      const hasSpecialRole = ['admin', 'gabai', 'manager'].includes(req.user.rols || req.user.role);
      
      console.log(`Debt owner: ${debt.userId}, isOwner: ${isOwner}, hasSpecialRole: ${hasSpecialRole}`);
      
      if (!isOwner && !hasSpecialRole) {
          console.log(`Forbidden: User ${req.user.id} not authorized to update payment ${paymentId}`);
          return res.status(403).json({ message: "Forbidden: You are not authorized to update this payment" });
      }

      debt.isPaid = isPaid;
      if (isPaid) {
          debt.paidAmount = debt.amount;
          debt.paidDate = new Date();
          debt.paymentHistory.push({
              amount: debt.amount - (debt.paidAmount || 0),
              date: new Date(),
              note: 'תשלום מלא'
          });
      }

      await debt.save();
      console.log(`Payment status updated successfully for ID: ${paymentId}`);
      res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
      console.error('Error updating payment:', error);
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid paymentId', error: error.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Make partial payment
router.post('/payment/:paymentId/partial', auth, async (req, res) => {
  try {
      const { paymentId } = req.params;
      const { amount, note } = req.body;
      
      console.log(`Received request for partial payment for ID: ${paymentId}, amount: ${amount}`);
      console.log(`User making request: ${req.user.id}, role: ${req.user.rols || req.user.role}`);

      if (!amount || isNaN(amount) || amount <= 0) {
          return res.status(400).json({ message: 'Invalid payment amount' });
      }

      const debt = await Debt.findById(paymentId);
      if (!debt) {
          console.log(`Payment not found with ID: ${paymentId}`);
          return res.status(404).json({ message: 'Payment not found' });
      }

      // Allow the user who owns the debt or users with admin/gabai/manager roles
      const isOwner = debt.userId.toString() === req.user.id;
      const hasSpecialRole = ['admin', 'gabai', 'manager'].includes(req.user.rols || req.user.role);
      
      console.log(`Debt owner: ${debt.userId}, isOwner: ${isOwner}, hasSpecialRole: ${hasSpecialRole}`);
      
      if (!isOwner && !hasSpecialRole) {
          console.log(`Forbidden: User ${req.user.id} not authorized to update payment ${paymentId}`);
          return res.status(403).json({ message: "Forbidden: You are not authorized to update this payment" });
      }

      // Validate that the amount doesn't exceed the remaining amount
      const remainingAmount = debt.amount - (debt.paidAmount || 0);
      if (amount > remainingAmount) {
          return res.status(400).json({ 
              message: `סכום התשלום (${amount}₪) גבוה מהסכום שנותר לתשלום (${remainingAmount}₪)` 
          });
      }

      // Add to payment history
      debt.paymentHistory.push({
          amount,
          date: new Date(),
          note: note || 'תשלום חלקי'
      });

      // Update paid amount
      debt.paidAmount = (debt.paidAmount || 0) + amount;

      // Check if fully paid
      if (debt.paidAmount >= debt.amount) {
          debt.isPaid = true;
          debt.paidDate = new Date();
      }

      await debt.save();
      console.log(`Partial payment recorded successfully for ID: ${paymentId}`);
      res.status(200).json({ 
          message: 'Partial payment recorded successfully',
          debt: debt
      });
  } catch (error) {
      console.error('Error recording partial payment:', error);
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid paymentId', error: error.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update debt details
router.put('/debt/:debtId', auth, async (req, res) => {
  try {
    const { debtId } = req.params;
    const { amount, parsha, aliyaType } = req.body;
    
    const debt = await Debt.findById(debtId);
    if (!debt) {
      return res.status(404).json({ message: 'חוב לא נמצא' });
    }   

    // Check if the new amount is greater than the paid amount
    const paidAmount = debt.paidAmount || 0;
    const shouldUpdatePaymentStatus = amount > paidAmount;

    debt.amount = amount;
    debt.parsha = parsha;
    debt.aliyaType = aliyaType;

    // If the new amount is greater than what was paid, mark as unpaid
    if (shouldUpdatePaymentStatus && debt.isPaid) {
      debt.isPaid = false;
    }

    await debt.save();
    res.status(200).json({ message: 'חוב עודכן בהצלחה' });
  } catch (error) {
    console.error('Error updating debt:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid debtId', error: error.message });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get user details with debts (admin/gabai view)
router.get('/user/:userId/details', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'מזהה משתמש לא תקין' });
    }
    
    const user = await User.findById(userId)
      .select('firstName fatherName lastName phone')
      .populate({
        path: 'debts',
        select: 'userId amount paidAmount date parsha aliyaType isPaid paymentHistory paidDate',
        options: { sort: { date: -1 } } // Sort by date descending (newest first)
      });
      
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    
    // Calculate debt statistics
    const debts = user.debts.map(debt => debt.toObject({ virtuals: true }));
    const statistics = debts.reduce((acc, debt) => {
      acc.totalAmount += debt.amount;
      acc.paidAmount += debt.paidAmount || 0;
      acc.unpaidAmount += debt.remainingAmount || Math.max(0, debt.amount - (debt.paidAmount || 0));
      acc.aliyotCount++;
      return acc;
    }, {
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      aliyotCount: 0
    });
    
    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        fatherName: user.fatherName,
        lastName: user.lastName,
        phone: user.phone,
      },
      debts,
      statistics
    });
  } catch (error) {
    console.error('Error fetching user details with debts:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית', error: error.message });
  }
});

// Delete a debt
router.delete('/debt/:id', auth, async (req, res) => {
  try {
    const debtId = req.params.id;
    
    console.log(`Received request to delete debt with ID: ${debtId}`);
    console.log(`User making request: ${req.user.id}, role: ${req.user.rols || req.user.role}`);
    
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      console.log(`Invalid debt ID format: ${debtId}`);
      return res.status(400).json({ message: 'Invalid debt ID format' });
    }
    
    // Find the debt
    const debt = await Debt.findById(debtId);
    if (!debt) {
      console.log(`Debt not found with ID: ${debtId}`);
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    console.log(`Found debt to delete: ${JSON.stringify(debt)}`);
    
    // Check if the user has permission to delete this debt
    const isOwner = debt.userId.toString() === req.user.id;
    const hasSpecialRole = ['admin', 'gabai', 'manager'].includes(req.user.rols || req.user.role);
    
    console.log(`Debt owner: ${debt.userId}, isOwner: ${isOwner}, hasSpecialRole: ${hasSpecialRole}`);
    
    if (!isOwner && !hasSpecialRole) {
      console.log(`Forbidden: User ${req.user.id} not authorized to delete debt ${debtId}`);
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this debt" });
    }
    
    // Find the user and remove the debt from their debts array
    const user = await User.findById(debt.userId);
    if (user) {
      console.log(`Updating user ${user._id} to remove debt ${debtId} from their debts array`);
      user.debts = user.debts.filter(id => id.toString() !== debtId);
      await user.save();
      console.log(`User updated successfully`);
    } else {
      console.log(`User not found for debt ${debtId}`);
    }
    
    // Delete the debt
    const deleteResult = await Debt.findByIdAndDelete(debtId);
    console.log(`Debt deletion result: ${deleteResult ? 'Success' : 'Failed'}`);
    
    res.status(200).json({ message: 'Debt deleted successfully' });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route for /api/debts/:id/pay
router.put('/debts/:id/pay', auth, async (req, res) => {
  try {
    const debtId = req.params.id;
    const { isPaid } = req.body;
    
    console.log(`Received request to update payment status for ID (via /api/debts): ${debtId}, isPaid: ${isPaid}`);
    console.log(`User making request: ${req.user.id}, role: ${req.user.rols || req.user.role}`);
    
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      console.log(`Invalid debt ID format: ${debtId}`);
      return res.status(400).json({ message: 'Invalid debt ID format' });
    }
    
    // Find the debt
    const debt = await Debt.findById(debtId);
    if (!debt) {
      console.log(`Debt not found with ID: ${debtId}`);
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    // Check if the user has permission to update this debt
    const isOwner = debt.userId.toString() === req.user.id;
    const hasSpecialRole = ['admin', 'gabai', 'manager'].includes(req.user.rols || req.user.role);
    
    console.log(`Debt owner: ${debt.userId}, isOwner: ${isOwner}, hasSpecialRole: ${hasSpecialRole}`);
    
    if (!isOwner && !hasSpecialRole) {
      console.log(`Forbidden: User ${req.user.id} not authorized to update payment ${debtId}`);
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this payment" });
    }
    
    // Update the debt
    debt.isPaid = isPaid;
    if (isPaid) {
      debt.paidAmount = debt.amount;
      debt.paidDate = new Date();
      debt.paymentHistory.push({
        amount: debt.amount - (debt.paidAmount || 0),
        date: new Date(),
        note: 'תשלום מלא'
      });
    }
    
    await debt.save();
    console.log(`Payment status updated successfully for ID: ${debtId}`);
    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route for /api/debts/:id/partial-payment
router.post('/debts/:id/partial-payment', auth, async (req, res) => {
  try {
    const debtId = req.params.id;
    const { amount, note } = req.body;
    
    console.log(`Received request for partial payment for ID (via /api/debts): ${debtId}, amount: ${amount}`);
    console.log(`User making request: ${req.user.id}, role: ${req.user.rols || req.user.role}`);
    
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      console.log(`Invalid debt ID format: ${debtId}`);
      return res.status(400).json({ message: 'Invalid debt ID format' });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log(`Invalid payment amount: ${amount}`);
      return res.status(400).json({ message: 'Invalid payment amount' });
    }
    
    // Find the debt
    const debt = await Debt.findById(debtId);
    if (!debt) {
      console.log(`Debt not found with ID: ${debtId}`);
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    // Check if the user has permission to update this debt
    const isOwner = debt.userId.toString() === req.user.id;
    const hasSpecialRole = ['admin', 'gabai', 'manager'].includes(req.user.rols || req.user.role);
    
    console.log(`Debt owner: ${debt.userId}, isOwner: ${isOwner}, hasSpecialRole: ${hasSpecialRole}`);
    
    if (!isOwner && !hasSpecialRole) {
      console.log(`Forbidden: User ${req.user.id} not authorized to update payment ${debtId}`);
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this payment" });
    }
    
    // Validate that the amount doesn't exceed the remaining amount
    const remainingAmount = debt.amount - (debt.paidAmount || 0);
    if (amount > remainingAmount) {
      console.log(`Payment amount ${amount} exceeds remaining amount ${remainingAmount}`);
      return res.status(400).json({ 
        message: `סכום התשלום (${amount}₪) גבוה מהסכום שנותר לתשלום (${remainingAmount}₪)` 
      });
    }
    
    // Add to payment history
    debt.paymentHistory.push({
      amount,
      date: new Date(),
      note: note || 'תשלום חלקי'
    });
    
    // Update paid amount
    debt.paidAmount = (debt.paidAmount || 0) + amount;
    
    // Check if fully paid
    if (debt.paidAmount >= debt.amount) {
      debt.isPaid = true;
      debt.paidDate = new Date();
    }
    
    await debt.save();
    console.log(`Partial payment recorded successfully for ID: ${debtId}`);
    res.status(200).json({ 
      message: 'Partial payment recorded successfully',
      debt: debt
    });
  } catch (error) {
    console.error('Error recording partial payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route for /api/debts/:id (DELETE)
router.delete('/debts/:id', auth, async (req, res) => {
  try {
    const debtId = req.params.id;
    
    console.log(`Received request to delete debt with ID (via /api/debts): ${debtId}`);
    console.log(`User making request: ${req.user.id}, role: ${req.user.rols || req.user.role}`);
    
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      console.log(`Invalid debt ID format: ${debtId}`);
      return res.status(400).json({ message: 'Invalid debt ID format' });
    }
    
    // Find the debt
    const debt = await Debt.findById(debtId);
    if (!debt) {
      console.log(`Debt not found with ID: ${debtId}`);
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    console.log(`Found debt to delete: ${JSON.stringify(debt)}`);
    
    // Check if the user has permission to delete this debt
    const isOwner = debt.userId.toString() === req.user.id;
    const hasSpecialRole = ['admin', 'gabai', 'manager'].includes(req.user.rols || req.user.role);
    
    console.log(`Debt owner: ${debt.userId}, isOwner: ${isOwner}, hasSpecialRole: ${hasSpecialRole}`);
    
    if (!isOwner && !hasSpecialRole) {
      console.log(`Forbidden: User ${req.user.id} not authorized to delete debt ${debtId}`);
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this debt" });
    }
    
    // Find the user and remove the debt from their debts array
    const user = await User.findById(debt.userId);
    if (user) {
      console.log(`Updating user ${user._id} to remove debt ${debtId} from their debts array`);
      user.debts = user.debts.filter(id => id.toString() !== debtId);
      await user.save();
      console.log(`User updated successfully`);
    } else {
      console.log(`User not found for debt ${debtId}`);
    }
    
    // Delete the debt
    const deleteResult = await Debt.findByIdAndDelete(debtId);
    console.log(`Debt deletion result: ${deleteResult ? 'Success' : 'Failed'}`);
    
    res.status(200).json({ message: 'Debt deleted successfully' });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;