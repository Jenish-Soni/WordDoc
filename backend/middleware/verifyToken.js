require('dotenv').config(); // Optional, if not already done in the main file

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Check for token in cookies or headers

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.userId; // Save user ID for later use
        next();
    });
};

module.exports = verifyToken; 