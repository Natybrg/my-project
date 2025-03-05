const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const aliyotRoutes = require('./routes/aliyot'); // הוסף את השורה הזו

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/aliyot', aliyotRoutes); // וודא שזה מוגדר נכון

// הוסף נתיב לדיבוג
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // נתיבים שהוגדרו ישירות על האפליקציה
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if (middleware.name === 'router') {
      // נתיבים שהוגדרו באמצעות router
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({ path: middleware.regexp.toString() + path, method });
        }
      });
    }
  });
  res.json(routes);
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://israel:12345654321@cluster0.htxff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
console.log('Connecting to MongoDB...');

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
const PORT = 3002; // Hardcoded port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});