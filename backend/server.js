// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const redisClient = require("./redisClient");
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

console.log('MongoDB URI:', process.env.MONGO_URI);

// Add graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  try {
    // Close Redis connection
    await redisClient.disconnect();
    console.log('✅ Redis connection closed');
    
    // Close MongoDB connection
    await client.close();
    console.log('✅ MongoDB connection closed');
    
    // Close Express server
    server.close(() => {
      console.log('✅ Express server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("load-document", async (docId) => {
    let document;
    try {
        const content = await redisClient.get(`doc:${docId}`);
        document = content ? JSON.parse(content) : { content: "" };
    } catch (error) {
        document = { content: "" };
    }
    await redisClient.set(`doc:${docId}`, JSON.stringify(document));
    socket.emit("document-data", document);
  });

  socket.on("edit-document", async ({ docId, content }) => {
    await redisClient.set(`doc:${docId}`, JSON.stringify({ content }));
    socket.broadcast.emit("document-update", { docId, content });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
