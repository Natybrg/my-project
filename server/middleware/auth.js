const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  console.log('Auth middleware running...');
  console.log('Request path:', req.path);
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'אנא התחבר למערכת' });
    }

    // Load secrets from environment variables with fallbacks
    const JWT_SECRET = process.env.JWT_SECRET || 'yourfallbacksecret';
    const TOKEN_SECRET = process.env.TOKEN_SECRET || 'yourfallbacksecret';
    
    console.log('JWT_SECRET exists:', !!JWT_SECRET);
    console.log('TOKEN_SECRET exists:', !!TOKEN_SECRET);
    
    let decoded;
    
    // Try JWT_SECRET first
    try {
      console.log('Trying to verify with JWT_SECRET...');
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified with JWT_SECRET');
    } catch (jwtError) {
      console.log('JWT_SECRET verification failed:', jwtError.message);
      
      // If JWT_SECRET fails, try TOKEN_SECRET
      try {
        console.log('Trying to verify with TOKEN_SECRET...');
        decoded = jwt.verify(token, TOKEN_SECRET);
        console.log('Token verified with TOKEN_SECRET');
      } catch (tokenError) {
        console.log('TOKEN_SECRET verification failed:', tokenError.message);
        throw new Error('Token verification failed with both secrets');
      }
    }
    
    console.log('Decoded token:', decoded);
    
    // הוספת המידע על המשתמש לבקשה
    req.user = { 
      id: decoded.userId || decoded.id,
      rols: decoded.role || decoded.rol || decoded.rols || 'user'  // תמיכה בכל סוגי השדות לצורך תאימות לאחור
    };
    
    console.log('User info added to request:', req.user);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.rols);
    
    next();
  } catch (error) {
    console.log('Auth middleware error:', error.message);
    res.status(401).json({ message: 'אנא התחבר מחדש למערכת' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  console.log('isAdmin middleware running...');
  console.log('User object:', req.user);
  
  if (!req.user) {
    console.log('No user object found in request');
    return res.status(401).json({ message: 'אנא התחבר למערכת' });
  }

  const userRole = req.user.rols;
  console.log('User role for admin check:', userRole);
  
  if (!['admin', 'manager'].includes(userRole)) {
    console.log('User role not authorized:', userRole);
    return res.status(403).json({ message: 'אין לך הרשאות מתאימות' });
  }

  console.log('User authorized as admin/manager');
  next();
};

module.exports = { auth, isAdmin };