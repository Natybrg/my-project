const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // בדיקת הטוקן מה-headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'אנא התחבר למערכת' });
    }

    // אימות הטוקן
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    
    // הוספת המידע על המשתמש לבקשה
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'אנא התחבר מחדש למערכת' });
  }
};

module.exports = auth;