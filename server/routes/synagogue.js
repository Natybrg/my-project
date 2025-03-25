const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const SynagogueLocation = require('../models/SynagogueLocation');
const Synagogue = require('../models/Synagogue');

// Get synagogue location - LEGACY ENDPOINT
router.get('/', async (req, res) => {
  try {
    let synagogue = await Synagogue.findOne();
    if (!synagogue) {
      return res.status(404).json({ message: 'מיקום בית הכנסת לא נמצא' });
    }
    
    // Convert openingHours to expected client format if needed
    const formattedOpeningHours = synagogue.openingHours || {};
    
    res.json({
      name: synagogue.name,
      address: synagogue.address,
      latitude: synagogue.latitude,
      longitude: synagogue.longitude,
      openingHours: formattedOpeningHours,
      hideOpeningHours: synagogue.hideOpeningHours || false,
      lastUpdated: synagogue.lastUpdated
    });
  } catch (err) {
    console.error('Error fetching synagogue location:', err);
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
});

// Update synagogue location - LEGACY ENDPOINT
router.put('/', auth, isAdmin, async (req, res) => {
  const { name, address, location, openingHours, hideOpeningHours } = req.body;
  console.log('Received openingHours:', JSON.stringify(openingHours));

  const locationFields = {};
  if (name) locationFields.name = name;
  if (address) locationFields.address = address;
  if (location && location.lat && location.lng) {
    locationFields.location = {
      lat: location.lat,
      lng: location.lng
    };
  }
  if (openingHours) {
    // Ensure openingHours is in the correct format for the database
    locationFields.openingHours = openingHours;
    console.log('Formatted openingHours for DB:', JSON.stringify(locationFields.openingHours));
  }
  if (hideOpeningHours !== undefined) locationFields.hideOpeningHours = hideOpeningHours;

  try {
    let synagogueLocation = await SynagogueLocation.findOne();

    if (synagogueLocation) {
      // עדכון מיקום קיים
      synagogueLocation = await SynagogueLocation.findOneAndUpdate(
        {}, 
        { $set: locationFields },
        { new: true }
      );
    } else {
      // יצירת מיקום חדש אם עדיין לא קיים
      synagogueLocation = new SynagogueLocation(locationFields);
      await synagogueLocation.save();
    }

    res.json(synagogueLocation);
  } catch (err) {
    console.error('Error updating synagogue location:', err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// NEW ENDPOINT - Get synagogue data from new model
router.get('/v2', async (req, res) => {
  try {
    const synagogue = await Synagogue.findOne();
    if (!synagogue) {
      // Try to get from old model if new one doesn't exist
      const location = await SynagogueLocation.findOne();
      if (location) {
        // Convert to new format for backward compatibility
        const formattedOpeningHours = location.openingHours || {};
        
        return res.json({
          name: location.name,
          address: location.address,
          latitude: location.location.lat,
          longitude: location.location.lng,
          openingHours: formattedOpeningHours,
          hideOpeningHours: location.hideOpeningHours || false,
          lastUpdated: location.lastUpdated
        });
      }
      return res.status(404).json({ message: 'מידע בית הכנסת לא נמצא' });
    }
    
    // Ensure the object format of openingHours is sent to the client
    const formattedOpeningHours = synagogue.openingHours || {};
    
    const response = {
      name: synagogue.name,
      address: synagogue.address,
      latitude: synagogue.latitude,
      longitude: synagogue.longitude,
      openingHours: formattedOpeningHours,
      hideOpeningHours: synagogue.hideOpeningHours || false,
      lastUpdated: synagogue.lastUpdated
    };
    
    console.log('Sending synagogue data to client:', JSON.stringify(response));
    res.json(response);
  } catch (err) {
    console.error('Error fetching synagogue data:', err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// NEW ENDPOINT - Update synagogue data with new model
router.post('/update', auth, isAdmin, async (req, res) => {
  const { name, address, latitude, longitude, openingHours, hideOpeningHours } = req.body;
  console.log('Update request body:', JSON.stringify(req.body));

  // Validate required fields
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ message: 'חסרים שדות חובה (שם, כתובת, קו רוחב, קו אורך)' });
  }

  const synagogueFields = {
    name,
    address,
    latitude,
    longitude,
    lastUpdated: Date.now()
  };

  if (openingHours) {
    // Ensure openingHours is in the correct format for the database
    synagogueFields.openingHours = openingHours;
    console.log('Formatted openingHours for DB:', JSON.stringify(synagogueFields.openingHours));
  }
  
  if (hideOpeningHours !== undefined) synagogueFields.hideOpeningHours = hideOpeningHours;

  try {
    let synagogue = await Synagogue.findOne();

    if (synagogue) {
      // עדכון מידע קיים
      synagogue = await Synagogue.findOneAndUpdate(
        {}, 
        { $set: synagogueFields },
        { new: true }
      );
    } else {
      // יצירת מידע חדש אם עדיין לא קיים
      synagogue = new Synagogue(synagogueFields);
      await synagogue.save();
    }

    // עדכון גם במודל הישן לתאימות לאחור
    const oldModelFields = {
      name,
      address,
      location: {
        lat: latitude,
        lng: longitude
      },
      lastUpdated: Date.now()
    };
    
    if (openingHours) oldModelFields.openingHours = openingHours;
    if (hideOpeningHours !== undefined) oldModelFields.hideOpeningHours = hideOpeningHours;
    
    await SynagogueLocation.findOneAndUpdate(
      {}, 
      { $set: oldModelFields },
      { new: true, upsert: true }
    );

    // Return formatted response
    const response = {
      name: synagogue.name,
      address: synagogue.address,
      latitude: synagogue.latitude,
      longitude: synagogue.longitude,
      openingHours: synagogue.openingHours || {},
      hideOpeningHours: synagogue.hideOpeningHours || false,
      lastUpdated: synagogue.lastUpdated
    };
    
    console.log('Sending updated synagogue data to client:', JSON.stringify(response));
    res.json(response);
  } catch (err) {
    console.error('Error updating synagogue:', err.message);
    res.status(500).send('שגיאת שרת בעדכון הנתונים');
  }
});

module.exports = router; 