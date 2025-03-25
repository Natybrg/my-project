const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const aliyotRoutes = require('./routes/aliyot');
const reminderRoutes = require('./routes/reminders');
const synagogueRoutes = require('./routes/synagogue');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
const app = express();

// Set up fallback secrets if not in environment
process.env.JWT_SECRET = process.env.JWT_SECRET || 'defaultJwtSecret';
process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || 'defaultTokenSecret';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Enhanced debugging
console.log('==== ENVIRONMENT VARIABLES ====');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Missing!');
console.log('TOKEN_SECRET:', process.env.TOKEN_SECRET ? 'Loaded' : 'Missing!');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Missing!');
console.log('===============================');

// Routes - ensure consistent API prefix
app.use('/api/auth', authRoutes);
app.use('/api/aliyot', aliyotRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/synagogue', synagogueRoutes);

// Also support legacy routes without /api prefix for backward compatibility
app.use('/auth', authRoutes);
app.use('/aliyot', aliyotRoutes);
app.use('/reminders', reminderRoutes);
app.use('/synagogue', synagogueRoutes);

// Debug route - list all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if (middleware.name === 'router') {
      // Routes added via router
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const basePath = middleware.regexp.toString();
          const path = handler.route.path;
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({ 
            path: basePath + path, 
            method 
          });
        }
      });
    }
  });
  res.json(routes);
});

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/synagogue';
const PORT = process.env.PORT || 3002;

console.log('Connecting to MongoDB...', mongoURI);
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    
    // Check for synagogue data and create if needed
    const Synagogue = require('./models/Synagogue');
    const synagogueData = await Synagogue.findOne();
    
    if (!synagogueData) {
      console.log('No synagogue data found, creating default...');
      const defaultSynagogue = new Synagogue({
        name: 'בית הכנסת המרכזי',
        address: 'רחוב הרצל 1, ירושלים',
        latitude: 31.778,
        longitude: 35.225,
        openingHours: {
          sunday: { open: '06:00', close: '21:00' },
          monday: { open: '06:00', close: '21:00' },
          tuesday: { open: '06:00', close: '21:00' },
          wednesday: { open: '06:00', close: '21:00' },
          thursday: { open: '06:00', close: '21:00' },
          friday: { open: '06:00', close: '19:00' },
          saturday: { open: '08:00', close: '20:00' }
        },
        hideOpeningHours: false
      });
      
      await defaultSynagogue.save();
      console.log('Default synagogue data created successfully!');
    }
  })
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});