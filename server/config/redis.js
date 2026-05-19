const redis = require("redis");

let client = null;
let isConnected = false;

const createRedisClient = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    console.log("[Redis] Attempting to connect...");
    
    const tempClient = redis.createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
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
    console.error("[Redis] Failed to connect:", error.message);
    console.warn("[Redis] Running without caching - some features will be slow");
    isConnected = false;
  }
};

// Initialize connection
createRedisClient();

// Wrapper functions that handle failures gracefully
const redisWrapper = {
  get: async (key) => {
    if (!client || !isConnected) {
      console.warn("[Redis] Not connected, skipping GET");
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
      console.warn("[Redis] Not connected, skipping SET");
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
      console.warn("[Redis] Not connected, skipping DEL");
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