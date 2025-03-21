const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { verifyManager } = require('../middleware/loginMiddelwares');
const auth = require('../middleware/auth');

// הוספת תזכורת חדשה - רק למנהלים ומעלה
router.post('/', auth, verifyManager, async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ message: 'כותרת ותאריך הם שדות חובה' });
    }
    
    const reminder = new Reminder({
      title,
      description,
      date: new Date(date),
      createdBy: req.user.id
    });
    
    await reminder.save();
    
    res.status(201).json({ 
      message: 'התזכורת נוצרה בהצלחה', 
      reminder 
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית', error: error.message });
  }
});

// קבלת כל התזכורות - זמין לכל המשתמשים המחוברים
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .sort({ date: 1 })
      .populate('createdBy', 'firstName lastName');
    
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית', error: error.message });
  }
});

// קבלת תזכורות לטווח תאריכים - זמין לכולם (גם למשתמשים לא מחוברים)
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // שליפת כל התזכורות בטווח התאריכים - ללא בדיקת אימות
    const reminders = await Reminder.find({
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    });
    
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// עדכון תזכורת - רק למנהלים ומעלה
router.put('/:id', auth, verifyManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ message: 'כותרת ותאריך הם שדות חובה' });
    }
    
    const reminder = await Reminder.findById(id);
    
    if (!reminder) {
      return res.status(404).json({ message: 'התזכורת לא נמצאה' });
    }
    
    reminder.title = title;
    reminder.description = description;
    reminder.date = new Date(date);
    
    await reminder.save();
    
    res.status(200).json({ 
      message: 'התזכורת עודכנה בהצלחה', 
      reminder 
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית', error: error.message });
  }
});

// מחיקת תזכורת - רק למנהלים ומעלה
router.delete('/:id', auth, verifyManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    const reminder = await Reminder.findById(id);
    
    if (!reminder) {
      return res.status(404).json({ message: 'התזכורת לא נמצאה' });
    }
    
    await Reminder.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: 'התזכורת נמחקה בהצלחה'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית', error: error.message });
  }
});

module.exports = router;