const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');

// הוספת עליה למשתמש
router.post('/addAliyah', async (req, res) => {
  try {
    const { userId, parsha, aliyaType, amount } = req.body;
    const aliyah = new Debt({ userId, parsha, aliyaType, amount });
    await aliyah.save();

    const user = await User.findById(userId);
    user.debts.push(aliyah._id);
    await user.save();

    res.status(200).json({ message: 'Aliyah added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// קבלת העליות של המשתמש
router.get('/:userId/aliyot', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('debts');
    res.status(200).json(user.debts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to your aliyot.js file
// עדכון סטטוס תשלום
router.put('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { isPaid } = req.body;
    
    console.log('Updating payment:', paymentId, 'to isPaid:', isPaid); // הוספת לוג לדיבוג
    
    const debt = await Debt.findById(paymentId);
    if (!debt) {
      return res.status(404).json({ message: 'התשלום לא נמצא' });
    }
    
    debt.isPaid = isPaid;
    if (isPaid) {
      debt.paidDate = new Date();
    }
    
    await debt.save();
    res.status(200).json({ message: 'סטטוס התשלום עודכן בהצלחה' });
  } catch (error) {
    console.error('Error updating payment:', error); // הוספת לוג לדיבוג
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;