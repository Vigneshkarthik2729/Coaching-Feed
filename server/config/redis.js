const redis = require("redis");

let client = null;
let isConnected = false;
let connectionAttempted = false;

const createRedisClient = async () => {
  // Only attempt connection once per server startup
  if (connectionAttempted) {
    return;
  }
  connectionAttempted = true;

  try {
    const redisUrl = process.env.REDIS_URL;
    
    // Skip Redis if URL is empty or localhost
    if (!redisUrl || redisUrl.includes("127.0.0.1") || redisUrl.includes("localhost")) {
      console.warn("[Redis] Redis URL is localhost. Skipping Redis connection (this is expected on Render)");
      console.warn("[Redis] Running without caching - data will be fetched from MongoDB each time");
      isConnected = false;
      return;
    }

    console.log("[Redis] Attempting to connect...");
    
    const tempClient = redis.createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: () => false, // Don't reconnect after first failure
      },
    });

    tempClient.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
      isConnected = false;
    });

    tempClient.on("connect", () => {
      console.log("[Redis] Connected successfully");
      isConnected = true;
    });

    tempClient.on("disconnect", () => {
      console.warn("[Redis] Disconnected");
      isConnected = false;
    });

    await tempClient.connect();
    client = tempClient;
    isConnected = true;
    console.log("[Redis] Ready to use");
  } catch (error) {
    console.warn("[Redis] Not available:", error.message);
    console.warn("[Redis] Continuing without caching (this is normal on Render free tier)");
    isConnected = false;
  }
};

// Initialize connection
createRedisClient();

// Wrapper functions that handle failures gracefully
const redisWrapper = {
  get: async (key) => {
    if (!client || !isConnected) {
      return null;
    }
    try {
      return await client.get(key);
    } catch (err) {
      console.error("[Redis] GET error:", err.message);
      return null;
    }
  },

  set: async (key, value) => {
    if (!client || !isConnected) {
      return;
    }
    try {
      return await client.set(key, value);
    } catch (err) {
      console.error("[Redis] SET error:", err.message);
    }
  },

  del: async (key) => {
    if (!client || !isConnected) {
      return;
    }
    try {
      return await client.del(key);
    } catch (err) {
      console.error("[Redis] DEL error:", err.message);
    }
  },
};

module.exports = redisWrapper;