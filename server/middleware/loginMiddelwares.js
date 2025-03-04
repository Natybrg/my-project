const jwt = require('jsonwebtoken');
const User = require('../User/UserModel.js');

async function verifyToken(permission, req, res, next) {
    try {
        const [type, token] = req.headers.authorization?.split(' ') || [];
        if (type !== 'Bearer' || !token)
            throw new Error('Unauthorized');
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(data.userId);

        if (!user)
            throw new Error('Unauthorized');
        if (permission !== 'user' && user.Permission !== permission)
            throw new Error('Unauthorized');

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

const verifyUser = (req, res, next) => verifyToken('user', req, res, next);
const verifyAdmin = (req, res, next) => verifyToken('admin', req, res, next);
const verifyGabay = (req, res, next) => verifyToken('gabay', req, res, next);
const verifyManager = (req, res, next) => verifyToken('manager', req, res, next);

module.exports = { verifyUser, verifyAdmin, verifyGabay, verifyManager };

