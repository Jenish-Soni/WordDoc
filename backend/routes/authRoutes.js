// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/user");
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// 🔹 User Registration
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// 🔹 User Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Use the same JWT_SECRET from environment variables
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (24 hours)
    });

    // Return token with Bearer prefix
    res.json({ token: `Bearer ${token}` });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🔹 Verify Token Middleware
const verifyTokenMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "No token provided" });

  try {
    // Remove 'Bearer ' prefix if present
    const tokenString = token.replace('Bearer ', '');
    
    // Use the same JWT_SECRET from environment variables
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token
        res.status(201).json({
            message: 'User created successfully',
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.get('/check-auth', verifyTokenMiddleware, (req, res) => {
    res.json({ token: req.token }); // Send back the token if valid
});

// Add this new route for checking authentication
router.get('/check', verifyToken, async (req, res) => {
    try {
        // If verifyToken middleware passes, user is authenticated
        res.json({ 
            authenticated: true,
            token: req.token // Send back the token if you want to refresh it
        });
    } catch (error) {
        res.status(401).json({ 
            authenticated: false,
            message: 'Invalid token' 
        });
    }
});

module.exports = { router, verifyToken: verifyTokenMiddleware };
