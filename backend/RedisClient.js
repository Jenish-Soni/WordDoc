// redisClient.js
const Redis = require("ioredis");

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});

redisClient.on("connect", () => console.log("🔥 Redis Connected!"));
redisClient.on("error", (err) => console.error("Redis Error:", err));

module.exports = redisClient;
