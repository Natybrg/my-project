const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
// נתיב הרשמה
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { firstName, fatherName, lastName, phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "משתמש קיים במערכת" });
    }

    // Create new user
    const user = new User({
      firstName,
      fatherName,
      lastName,
      phone,
      password,
    });

    await user.save();

    // Create token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.status(201).json({ token, userId: user._id }); // כלול userId בתגובה
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// נתיב התחברות
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
    res.json({ token, userId: user._id }); // כלול userId בתגובה
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// api/users.js

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, fatherName, lastName, phone } = req.body;

    // Validate if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          firstName,
          fatherName,
          lastName,
          phone
        }
      },
      { new: true } // Return the updated document
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
