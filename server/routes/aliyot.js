const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');
const { verifyGabay, verifyUser } = require('../middleware/loginMiddelwares');

// Add Aliyah to user
router.post('/addAliyah',verifyGabay ,auth, async (req, res) => {
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

      const aliyah = new Debt({ userId, parsha, aliyaType, amount, isPaid });
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
router.get('/:userId/aliyot',auth, async (req, res) => {
  try {
      const { userId } = req.params;
      const user = await User.findById(userId).populate('debts');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user.debts);
  } catch (error) {
      console.error('Error fetching aliyot:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update payment status
router.put('/payment/:paymentId', verifyUser, auth, async (req, res) => {
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
      debt.paidDate = isPaid ? new Date() : null;

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

module.exports = router;

