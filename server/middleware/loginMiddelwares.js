const jwt = require('jsonwebtoken');
const User = require('../models/User');

const permissions = ['admin', 'manager', 'gabai', 'user'];
const checkPermission = (minimalPermission, userPermission) => {
    const minIndex = permissions.indexOf(minimalPermission);
    const userIndex = permissions.indexOf(userPermission);
    
    // אם התפקיד לא נמצא, או אם תפקיד המשתמש נמוך יותר מהתפקיד הנדרש
    if (minIndex === -1 || userIndex === -1 || userIndex > minIndex) {
        return false;
    }
    return true;
};

async function verifyToken(permission, req, res, next) {
    try {
        const [type, token] = req.headers.authorization?.split(' ') || [];
        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        }

        let data;
        try {
            data = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            if (jwtErr instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ error: 'Unauthorized: Token expired' });
            } else if (jwtErr instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            } else {
                return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
            }
        }

        const user = await User.findById(data.userId);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        // בדיקה אם יש תפקיד בטוקן
        if (data.role || data.rol) {
            // השתמש בתפקיד מהטוקן
            const tokenRole = data.role || data.rol;
            if (!checkPermission(permission, tokenRole)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
        } else {
            // אם אין תפקיד בטוקן, השתמש בתפקיד מהמשתמש
            if (!checkPermission(permission, user.rols)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const verifyUser = (req, res, next) => verifyToken('user', req, res, next);
const verifyAdmin = (req, res, next) => verifyToken('admin', req, res, next);
const verifyGabai = (req, res, next) => verifyToken('gabai', req, res, next);
const verifyManager = (req, res, next) => verifyToken('manager', req, res, next);

module.exports = { verifyUser, verifyAdmin, verifyGabai, verifyManager };