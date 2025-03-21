const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyUser, verifyAdmin, verifyGabay, verifyManager } = require("../middleware/loginMiddelwares");
const auth = require("../middleware/auth");

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
  console.log("Login request body:", req.body);
  
  const { phone, password } = req.body;
  const errors = [];

  console.log("Phone received:", phone, "Type:", typeof phone);
  console.log("Password received:", password ? "***" : "undefined", "Type:", typeof password);

  if (!phone) {
    errors.push("מספר טלפון חסר");
  } else if (!/^\d{10}$/.test(phone)) {
    errors.push("מספר טלפון חייב להכיל בדיוק 10 ספרות");
  }

  if (!password) {
    errors.push("סיסמה חסרה");
  } else if (password.length < 6) {
    errors.push("סיסמה חייבת להכיל לפחות 6 תווים");
  }

  if (errors.length > 0) {
    console.log("Validation errors:", errors);
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

      // Create new user - password will be hashed by the pre-save hook in the User model
      const user = new User({
          firstName,
          fatherName,
          lastName,
          phone,
          password, // No need to hash here, the model will do it
          rols: rols || 'user'
      });

      await user.save();

      if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const token = jwt.sign({ userId: user._id, role: user.rols }, process.env.JWT_SECRET, { expiresIn: "24h" });
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
    console.log("Login attempt with:", { phone, password: password ? "***" : "undefined" });

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      console.log("User not found with phone:", phone);
      return res.status(400).json({ message: "מספר טלפון או סיסמה שגויים" });
    }
    console.log("User found:", {
      id: user._id,
      firstName: user.firstName,
      role: user.rols,
      hasPassword: !!user.password
    });

    // Validate password using the model's method
    console.log("Comparing password...");
    try {
      // Use the User model's comparePassword method
      const isMatch = await user.comparePassword(password);
      console.log("Password match result:", isMatch);
      
      if (!isMatch) {
        console.log("Password does not match");
        return res.status(400).json({ message: "מספר טלפון או סיסמה שגויים" });
      }
    } catch (bcryptError) {
      console.error("Password comparison error:", bcryptError);
      return res.status(500).json({ message: "שגיאה באימות סיסמה", error: bcryptError.message });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.rols }, process.env.JWT_SECRET, { expiresIn: "24h" });

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const requesterUser = await User.findById(decoded.userId);
    if (!requesterUser || !['admin', 'gabai', 'manager'].includes(requesterUser.rols)) {
      return res.status(403).json({ message: 'אין הרשאה לפעולה זו' });
    }

    console.log('User role:', requesterUser.rols);
    
    // הגדרת הרשאות צפייה לפי תפקיד
    let query = {};
    if (requesterUser.rols === 'admin') {
      query = {}; // מנהל רואה הכל
    } else if (requesterUser.rols === 'manager') {
      query = {}; // מנג'ר רואה הכל
    } else if (requesterUser.rols === 'gabai') {
      query = { rols: { $in: ['manager', 'gabai', 'user'] } }; // גבאי רואה את כולם חוץ מאדמין
    }

    console.log('Query:', query);
    
    // מיון המשתמשים לפי תפקיד בסדר הנדרש
    const users = await User.find(query)
      .sort({
        rols: 'asc',
        firstName: 'asc' // מיון משני לפי שם פרטי
      })
      .collation({
        locale: 'he', // מיון בעברית
        strength: 2
      })
      .transform(docs => {
        // מיון מותאם אישית לפי סדר התפקידים
        const roleOrder = {
          'admin': 1,
          'manager': 2,
          'gabai': 3,
          'user': 4
        };
        
        return docs.sort((a, b) => {
          const roleA = roleOrder[a.rols] || 999;
          const roleB = roleOrder[b.rols] || 999;
          if (roleA !== roleB) {
            return roleA - roleB;
          }
          // אם התפקידים זהים, מיין לפי שם פרטי
          return a.firstName.localeCompare(b.firstName, 'he');
        });
      });

    console.log('Found users:', users.length);
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

    // בדיקת הרשאות - רק מנהל יכול לשנות דרגות
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'אין הרשאה לפעולה זו' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const requesterUser = await User.findById(decoded.userId);
    if (!requesterUser || !['admin', 'gabai', 'manager'].includes(requesterUser.rols)) {
      return res.status(403).json({ message: 'אין הרשאה לפעולה זו' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // בדיקה אם מנסים להוריד דרגה ממנהל (כולל מניעת הורדת דרגה עצמית)
    if (user.rols === 'admin') {
      if (rols !== 'admin') {
        return res.status(403).json({ message: "לא ניתן להוריד דרגה ממנהל - גם לא על ידי מנהל אחר" });
      }
    }

    // רק מנהל יכול לשנות דרגות
    if (user.rols !== rols && requesterUser.rols !== 'admin') {
      return res.status(403).json({ message: "רק מנהל יכול לשנות דרגות" });
    }

    user.firstName = firstName;
    user.fatherName = fatherName;
    user.lastName = lastName;
    user.phone = phone;
    if (password) {
      user.password = password;
    }
    user.rols = rols;

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    
    // Validate inputs
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "מספר טלפון חייב להכיל בדיוק 10 ספרות" });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "סיסמה חייבת להכיל לפחות 6 תווים" });
    }
    
    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }
    
    // Update password
    user.password = newPassword; // Will be hashed by the pre-save hook
    await user.save();
    
    res.json({ message: "הסיסמה עודכנה בהצלחה" });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: "שגיאת שרת", error: error.message });
  }
});

// Get user profile by ID
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password'); // Exclude password from the response
    
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Update user profile
router.put('/user/:userId', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, fatherName, password } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    
    // Check permissions - only allow users to update their own profile or admins
    if (req.user.id !== req.params.userId && req.user.rols !== 'admin') {
      return res.status(403).json({ message: 'אין הרשאה לעדכן פרופיל של משתמש אחר' });
    }
    
    // Prepare update data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (fatherName) updateData.fatherName = fatherName;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// Add this route to your auth.js file where other user-related routes are defined

// Delete user - only for admins
router.delete('/users/:userId', auth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'המשתמש לא נמצא' });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ 
      message: 'המשתמש נמחק בהצלחה'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית', error: error.message });
  }
});

// Check authentication status
router.get('/check-auth', auth, async (req, res) => {
  try {
    console.log('Check auth request received');
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.rols);
    
    res.status(200).json({
      isAuthenticated: true,
      userId: req.user.id,
      role: req.user.rols
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
