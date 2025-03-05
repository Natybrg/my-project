const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyUser, verifyAdmin, verifyGabay, verifyManager } = require("../middleware/loginMiddelwares");

const validateRegistration = (req, res, next) => {
  const { firstName, fatherName, lastName, phone, password } = req.body;
  const errors = [];

  if (!firstName || firstName.length < 2) {
    errors.push("שם פרטי חייב להכיל לפחות 2 תווים");
  }

  if (!fatherName || fatherName.length < 2) {
    errors.push("שם האב חייב להכיל לפחות 2 תווים");
  }

  if (!lastName || lastName.length < 2) {
    errors.push("שם משפחה חייב להכיל לפחות 2 תווים");
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    errors.push("מספר טלפון חייב להכיל בדיוק 10 ספרות");
  }

  if (!password || password.length < 6) {
    errors.push("סיסמה חייבת להכיל לפחות 6 תווים");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { phone, password } = req.body;
  const errors = [];

  if (!phone || !/^\d{10}$/.test(phone)) {
    errors.push("מספר טלפון חייב להכיל בדיוק 10 ספרות");
  }

  if (!password || password.length < 6) {
    errors.push("סיסמה חייבת להכיל לפחות 6 תווים");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Registration route
router.post("/register", validateRegistration, async (req, res) => {
  try {
      const { firstName, fatherName, lastName, phone, password, rols } = req.body;

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
          return res.status(400).json({ message: "משתמש קיים במערכת" });
      }

      let hashedPassword;
      try {
          hashedPassword = await bcrypt.hash(password, 10);
      } catch (bcryptError) {
          console.error('bcrypt hash error:', bcryptError);
          return res.status(500).json({ message: "Server error", error: "Failed to hash password" });
      }

      const user = new User({
          firstName,
          fatherName,
          lastName,
          phone,
          password: hashedPassword,
          rols: rols || 'user'
      });

      await user.save();

      if (!process.env.TOKEN_SECRET) {
          throw new Error('TOKEN_SECRET is not defined in environment variables');
      }
      const token = jwt.sign({ userId: user._id, role: user.rols }, process.env.TOKEN_SECRET, { expiresIn: "24h" });
      res.status(201).json({ token, userId: user._id });
  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Login route
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "מספר טלפון או סיסמה שגויים" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "מספר טלפון או סיסמה שגויים" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.rols }, process.env.TOKEN_SECRET, { expiresIn: "24h" });

    // Return token and user info
    res.json({
      token,
      userId: user._id,
      firstName: user.firstName,
      role: user.rols, // שימוש ב-role לעקביות
      rol: user.rols, // שמירה על תאימות לאחור עם rol
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Get all users route
router.get("/users", async (req, res) => {
  try {
    // בדיקת הרשאות - רק מנהל, גבאי או מנג'ר יכולים לראות את כל המשתמשים
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'אין הרשאה לפעולה זו' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    
    const requesterUser = await User.findById(decoded.userId);
    if (!requesterUser || !['admin', 'gabai', 'manager'].includes(requesterUser.rols)) {
      return res.status(403).json({ message: 'אין הרשאה לפעולה זו' });
    }
    
    // אם המשתמש הוא מנג'ר, הוא יכול לראות רק גבאים ומשתמשים רגילים
    let query = {};
    if (requesterUser.rols === 'manager') {
      query = { rols: { $in: ['gabai', 'user'] } };
    }
    
    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user route - רק מנהל או גבאי יכולים לעדכן משתמשים
router.put("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, fatherName, lastName, phone, password, rols = 'user' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName;
    user.fatherName = fatherName;
    user.lastName = lastName;
    user.phone = phone;
    user.password = password;
    user.rols = rols;

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
