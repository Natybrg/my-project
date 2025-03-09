const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');
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
      
      // בדיקת הרשאות - מוודא שהמשתמש מחובר
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'אין הרשאה לפעולה זו' });
      }
      
      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtErr) {
        return res.status(401).json({ message: 'טוקן לא חוקי' });
      }
      
      // בודק אם המשתמש מנסה לצפות בנתונים של עצמו או שיש לו הרשאות מיוחדות
      const isOwnData = decoded.userId === userId;
      const userRole = decoded.role || decoded.rol; // Support both role and rol for backward compatibility
      
      // Allow all authenticated users to view their own data
      // Allow admin, gabai, and manager to view other users' data
      const hasSpecialPermission = ['admin', 'gabai', 'manager'].includes(userRole);
      
      if (!isOwnData && !hasSpecialPermission) {
        return res.status(403).json({ message: 'אין הרשאה לצפות בנתונים של משתמש אחר' });
      }
      
      const user = await User.findById(userId).populate({
          path: 'debts',
          // Explicitly include the paidAmount and paymentHistory fields in the response
          select: 'userId amount paidAmount date parsha aliyaType isPaid paymentHistory paidDate'
      });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      // Make sure the virtuals are included in the response
      const debts = user.debts.map(debt => {
          const debtObj = debt.toObject({ virtuals: true });
          // Ensure paidAmount is included and has a valid value
          debtObj.paidAmount = debt.paidAmount || 0;
          return debtObj;
      });
      
      res.status(200).json(debts);
  } catch (error) {
      console.error('Error fetching aliyot:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update payment status (full payment)
router.put('/payment/:paymentId', auth, async (req, res) => {
  try {
      const { paymentId } = req.params;
      const { isPaid } = req.body;
      const requestingUserId = req.user.id;
      const requestingUserRols = req.user.rols;

      if (typeof isPaid !== 'boolean') {
          return res.status(400).json({ message: 'Invalid isPaid value' });
      }

      const debt = await Debt.findById(paymentId);
      if (!debt) {
          return res.status(404).json({ message: 'Payment not found' });
      }

      if (debt.userId.toString() !== requestingUserId &&
          requestingUserRols !== 'admin' &&
          requestingUserRols !== 'gabay' &&
          requestingUserRols !== 'manager') {
          return res.status(403).json({ message: "Forbidden: You are not authorized to update this payment" });
      }

      debt.isPaid = isPaid;
      if (isPaid) {
          debt.paidAmount = debt.amount;
          debt.paidDate = new Date();
          debt.paymentHistory.push({
              amount: debt.amount - debt.paidAmount,
              date: new Date(),
              note: 'תשלום מלא'
          });
      }

      await debt.save();
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
      const requestingUserId = req.user.id;
      const requestingUserRols = req.user.rols;

      if (!amount || isNaN(amount) || amount <= 0) {
          return res.status(400).json({ message: 'Invalid payment amount' });
      }

      const debt = await Debt.findById(paymentId);
      if (!debt) {
          return res.status(404).json({ message: 'Payment not found' });
      }

      if (debt.userId.toString() !== requestingUserId &&
          requestingUserRols !== 'admin' &&
          requestingUserRols !== 'gabay' &&
          requestingUserRols !== 'manager') {
          return res.status(403).json({ message: "Forbidden: You are not authorized to update this payment" });
      }

      // Validate that the amount doesn't exceed the remaining amount
      const remainingAmount = debt.amount - debt.paidAmount;
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
      debt.paidAmount += amount;

      // Check if fully paid
      if (debt.paidAmount >= debt.amount) {
          debt.isPaid = true;
          debt.paidDate = new Date();
      }

      await debt.save();
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

    debt.amount = amount;
    debt.parsha = parsha;
    debt.aliyaType = aliyaType;

    await debt.save();
    res.status(200).json({ message: 'חוב עודפה בהצלחה' });
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

module.exports = router;
