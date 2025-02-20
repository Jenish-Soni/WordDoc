// server.js
require("dotenv").config();
require("./db");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const redis = require('./RedisClient');
const { router: authRoutes, verifyToken } = require("./routes/authRoutes");
const jwt = require('jsonwebtoken');
const Document = require('./model/document');
const documentRoutes = require('./routes/documentRoutes');

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

app.use(express.json());
app.use("/auth", authRoutes);

// Register document routes
app.use('/api/documents', documentRoutes);

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
  
  
// Redis document expiration time (in seconds)
const REDIS_DOC_EXPIRY = 1800; // 1 hour

io.on('connection', async (socket) => {
    console.log('New socket connection:', socket.id);

    socket.on('join-document', async ({ documentId }) => {
        try {
            console.log('Joining document:', documentId);

            if (!documentId) {
                throw new Error('Document ID is required');
            }

            // Check Redis first
            let content = await redis.get(`doc:${documentId}`);
            console.log('Redis content:', content);
            
            if (!content) {
                // If not in Redis, get from MongoDB
                const document = await Document.findById(documentId);
                console.log('MongoDB document:', document);

                if (!document) {
                    socket.emit('error', { message: 'Document not found' });
                    return;
                }
                content = document.content;
                // Cache in Redis with expiration
                await redis.setex(`doc:${documentId}`, REDIS_DOC_EXPIRY, content || '');
            } else {
                // Refresh expiration time when document is accessed
                await redis.expire(`doc:${documentId}`, REDIS_DOC_EXPIRY);
            }
            
            socket.join(documentId);
            socket.emit('load-document', { content });
            console.log(`User ${socket.user?.username} joined document ${documentId}`);
        } catch (error) {
            console.error('Error joining document:', error);
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('edit-document', async ({ documentId, content }) => {
        try {
            console.log('Editing document:', documentId);

            if (!documentId) {
                throw new Error('Document ID is required');
            }

            // Update Redis with new expiration
            await redis.setex(`doc:${documentId}`, REDIS_DOC_EXPIRY, content);
            console.log('Updated Redis for doc:', documentId);
            
            // Update MongoDB
            await Document.findByIdAndUpdate(documentId, {
                content,
                lastModified: new Date()
            });
            console.log('Updated MongoDB for doc:', documentId);

            // Broadcast to other clients
            socket.to(documentId).emit('document-update', {
                documentId,
                content,
                userId: socket.user?.userId,
                username: socket.user?.username
            });
        } catch (error) {
            console.error('Error updating document:', error);
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('leave-document', async ({ documentId }) => {
        try {
            console.log('Leaving document:', documentId);

            if (!documentId) {
                throw new Error('Document ID is required');
            }

            // Get content from Redis before potential expiration
            const content = await redis.get(`doc:${documentId}`);
            if (content) {
                // Save to MongoDB
                await Document.findByIdAndUpdate(documentId, {
                    content,
                    lastModified: new Date()
                });
                console.log('Final save to MongoDB for doc:', documentId);
            }
            
            socket.leave(documentId);
            console.log(`User ${socket.user?.username} left document ${documentId}`);
        } catch (error) {
            console.error('Error leaving document:', error);
        }
    });

    socket.on('disconnect', async () => {
        if (socket.updateTimeout) {
            clearTimeout(socket.updateTimeout);
        }
    });
});
  

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Gracefully shutting down...');
    try {
        await redis.quit();
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
