const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyGabay ,verifyUser} = require("../middleware/loginMiddelwares");
// const { verifyUser, verifyAdmin, verifyGabay, verifyManager } = require('../middleware/loginMiddelwares');

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
      const token = jwt.sign({ userId: user._id, rol: user.rols }, process.env.TOKEN_SECRET, { expiresIn: "24h" });
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

      const user = await User.findOne({ phone });
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }

      let isMatch;
      try {
          isMatch = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
          console.error('bcrypt compare error:', bcryptError);
          return res.status(500).json({ message: "Server error", error: "Failed to compare passwords" });
      }

      if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      if (!process.env.TOKEN_SECRET) {
          return res.status(500).json({ message: "Server error", error: "TOKEN_SECRET is not defined in environment variables" });
      }

      const token = jwt.sign({ userId: user._id, rol: user.rols }, process.env.TOKEN_SECRET, { expiresIn: "24h" });
      res.json({ token, userId: user._id, firstName: user.firstName, rol: user.rols });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Get all users route
router.get("/users", verifyGabay, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user route
router.put("/users/:userId",verifyGabay ,async (req, res) => {
  try{
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

