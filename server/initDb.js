/**
 * Database initialization script
 * Run this script to set up initial data in MongoDB
 * Usage: node initDb.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Models
const SynagogueLocation = require('./models/SynagogueLocation');
const Synagogue = require('./models/Synagogue');
const User = require('./models/User');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/synagogue';

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully!');

    // Create admin user if none exists
    const adminExists = await User.findOne({ rols: 'admin' });
    if (!adminExists) {
      console.log('Creating admin user...');
      const admin = new User({
        firstName: 'מנהל',
        lastName: 'ראשי',
        fatherName: '',
        phone: '0500000000',
        password: 'admin123',  // This will be hashed by the model
        rols: 'admin'
      });
      
      await admin.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists');
    }

    // Create default synagogue location if none exists
    const legacyLocationExists = await SynagogueLocation.findOne();
    if (!legacyLocationExists) {
      console.log('Creating default synagogue location in legacy model...');
      const defaultLocation = new SynagogueLocation({
        name: 'בית הכנסת המרכזי',
        address: 'רחוב הרצל 1, אשדוד',
        location: {
          lat: 31.7771,
          lng: 34.6488
        },
        openingHours: {
          sunday: { open: '07:00', close: '21:00' },
          monday: { open: '07:00', close: '21:00' },
          tuesday: { open: '07:00', close: '21:00' },
          wednesday: { open: '07:00', close: '21:00' },
          thursday: { open: '07:00', close: '21:00' },
          friday: { open: '07:00', close: '13:00' },
          saturday: { open: '18:00', close: '21:00' }
        }
      });
      
      await defaultLocation.save();
      console.log('Default synagogue location created successfully in legacy model!');
    } else {
      console.log('Legacy location model already exists');
    }

    // Create new synagogue model if none exists
    const newModelExists = await Synagogue.findOne();
    if (!newModelExists) {
      console.log('Creating default synagogue in new model...');
      
      // If legacy exists, copy data from it
      if (legacyLocationExists) {
        const newSynagogue = new Synagogue({
          name: legacyLocationExists.name,
          address: legacyLocationExists.address,
          latitude: legacyLocationExists.location?.lat || 31.7771,
          longitude: legacyLocationExists.location?.lng || 34.6488,
          openingHours: legacyLocationExists.openingHours,
          hideOpeningHours: legacyLocationExists.hideOpeningHours || false
        });
        
        await newSynagogue.save();
        console.log('Default synagogue created successfully in new model from legacy data!');
      } else {
        // Create from scratch if legacy doesn't exist
        const newSynagogue = new Synagogue({
          name: 'בית הכנסת המרכזי',
          address: 'רחוב הרצל 1, אשדוד',
          latitude: 31.7771,
          longitude: 34.6488,
          openingHours: {
            sunday: { open: '07:00', close: '21:00' },
            monday: { open: '07:00', close: '21:00' },
            tuesday: { open: '07:00', close: '21:00' },
            wednesday: { open: '07:00', close: '21:00' },
            thursday: { open: '07:00', close: '21:00' },
            friday: { open: '07:00', close: '13:00' },
            saturday: { open: '18:00', close: '21:00' }
          }
        });
        
        await newSynagogue.save();
        console.log('Default synagogue created successfully in new model!');
      }
    } else {
      console.log('New synagogue model already exists');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the initialization
initDatabase(); 