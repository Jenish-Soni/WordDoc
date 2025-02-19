// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/user");

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

    // Return token with Bearer prefix
    res.json({ token: `Bearer ${token}` });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🔹 Verify Token Middleware
const verifyToken = (req, res, next) => {
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

module.exports = { router, verifyToken };
