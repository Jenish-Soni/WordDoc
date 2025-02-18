// redisClient.js
const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URI
});

// Enable JSON commands
redisClient.json = redisClient.commandOptions({ isolated: true });

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('🔥 Redis Connected!'));

// Connect to Redis
redisClient.connect();

module.exports = redisClient;
