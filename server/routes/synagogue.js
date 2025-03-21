const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyToken } = require('../middleware/loginMiddelwares');

// Middleware to check if user has admin permissions
const checkAdminPermissions = async (req, res, next) => {
  try {
    const userRole = req.user.rols;
    if (!['admin', 'manager', 'gabai'].includes(userRole)) {
      return res.status(403).json({ message: 'אין לך הרשאה לבצע פעולה זו' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

// Update synagogue info
router.put('/info', auth, checkAdminPermissions, async (req, res) => {
  try {
    const { name, description, contact, rabbi, announcements } = req.body;
    
    // TODO: Add validation
    
    // TODO: Add database update logic
    
    res.json({ message: 'פרטי בית הכנסת עודכנו בהצלחה' });
  } catch (error) {
    console.error('Error updating synagogue info:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Update gallery images
router.put('/gallery/images', auth, checkAdminPermissions, async (req, res) => {
  try {
    const images = req.body;
    
    // TODO: Add validation
    
    // TODO: Add database update logic
    
    res.json({ message: 'תמונות הגלריה עודכנו בהצלחה' });
  } catch (error) {
    console.error('Error updating gallery images:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Update gallery settings
router.put('/gallery/settings', auth, checkAdminPermissions, async (req, res) => {
  try {
    const { autoPlay, interval } = req.body;
    
    // TODO: Add validation
    
    // TODO: Add database update logic
    
    res.json({ message: 'הגדרות הגלריה עודכנו בהצלחה' });
  } catch (error) {
    console.error('Error updating gallery settings:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Update synagogue location
router.put('/location', auth, checkAdminPermissions, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // TODO: Add validation
    
    // TODO: Add database update logic
    
    res.json({ message: 'מיקום בית הכנסת עודכן בהצלחה' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Update opening hours
router.put('/hours', auth, checkAdminPermissions, async (req, res) => {
  try {
    const hours = req.body;
    
    // TODO: Add validation
    
    // TODO: Add database update logic
    
    res.json({ message: 'שעות הפתיחה עודכנו בהצלחה' });
  } catch (error) {
    console.error('Error updating opening hours:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

module.exports = router; 