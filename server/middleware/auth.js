const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  console.log('Auth middleware running...');
  console.log('Request path:', req.path);
  
  try {
    // בדיקת הטוקן מה-headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'אנא התחבר למערכת' });
    }

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('TOKEN_SECRET exists:', !!process.env.TOKEN_SECRET);
    
    let decoded;
    
    // נסיון לאמת את הטוקן עם המפתח הראשון
    try {
      console.log('Trying to verify with JWT_SECRET...');
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('JWT_SECRET verification successful');
    } catch (firstError) {
      console.log('JWT_SECRET verification failed:', firstError.message);
      
      // אם נכשל, ננסה עם המפתח השני
      try {
        console.log('Trying to verify with TOKEN_SECRET...');
        decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('TOKEN_SECRET verification successful');
      } catch (secondError) {
        console.log('TOKEN_SECRET verification failed:', secondError.message);
        // אם שניהם נכשלו, נחזיר שגיאת אימות
        return res.status(401).json({ message: 'אנא התחבר מחדש למערכת' });
      }
    }
    
    console.log('Decoded token:', decoded);
    
    // הוספת המידע על המשתמש לבקשה
    req.user = { 
      id: decoded.userId || decoded.id,
      rols: decoded.role || decoded.rol || decoded.rols  // תמיכה בכל סוגי השדות לצורך תאימות לאחור
    };
    
    console.log('User info added to request:', req.user);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.rols);
    
    next();
  } catch (error) {
    console.log('Unexpected error in auth middleware:', error.message);
    res.status(401).json({ message: 'אנא התחבר מחדש למערכת' });
  }
};

module.exports = auth;