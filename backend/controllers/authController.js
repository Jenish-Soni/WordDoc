const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// During login/register when creating the token
const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
); 

router.post('/login', async (req, res) => {
    try {
        // ... authentication logic ...

        // Log the secret being used (temporary for debugging)
        // console.log('Secret used for token creation:', process.env.JWT_SECRET);
        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 