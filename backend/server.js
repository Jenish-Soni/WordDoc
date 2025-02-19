// server.js
require("dotenv").config();
require("./db");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const redis = require('redis');
const { router: authRoutes, verifyToken } = require("./routes/authRoutes");
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Add this check
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

// CORS configuration for Express
app.use(cors({
    origin: 'http://localhost:3000', // Frontend port
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO setup with CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

// Redis client setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URI
});

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('🔥 Redis Connected!'));

// Connect to Redis
redisClient.connect();

app.use(express.json());
app.use("/auth", authRoutes);

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        console.log('Raw token received:', token); // Debug log

        if (!token) {
            console.error('No token provided in socket connection');
            return next(new Error('Authentication token missing'));
        }

        // Handle both formats: with or without Bearer prefix
        const tokenString = token.includes('Bearer ') 
            ? token.split('Bearer ')[1] 
            : token;
            
        console.log('Token to verify:', tokenString); // Debug log

        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        console.log('Successfully authenticated socket user:', decoded);
        
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        next(new Error('Authentication failed: ' + error.message));
    }
});
  
  
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
  
    socket.on('join-document', async (docId) => {
      socket.join(docId);
  
      // Fetch document from Redis or MongoDB
      let docContent = await redisClient.get(docId);
      if (!docContent) {
        const doc = await Document.findById(docId);
        docContent = doc ? doc.content : '';
        await redisClient.set(docId, docContent);
      }
  
      socket.emit('load-document', docContent);
    });
  
    socket.on('edit-document', async ({ docId, content }) => {
      await redisClient.set(docId, content);
      socket.to(docId).emit('update-document', content);
    });
  
    socket.on('save-document', async ({ docId, content }) => {
      await Document.findByIdAndUpdate(docId, { content }, { upsert: true });
      await redisClient.set(docId, content);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Gracefully shutting down...');
    try {
        await redisClient.disconnect();
        console.log('✅ Redis connection closed');
        
        server.close(() => {
            console.log('✅ Express server closed');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

server.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
