const mongoose = require("mongoose");

const connectDB = async () => {

  try {

    console.log("[DB] Connecting to MongoDB...");
    const startTime = Date.now();

    await mongoose.connect(
      process.env.MONGO_URL
    );

    const connectionTime = Date.now() - startTime;
    console.log(`[DB] MongoDB Connected (${connectionTime}ms)`);

  } catch (error) {

    console.error("[DB] Connection error:", error.message);

    process.exit(1);

  }
};

module.exports = connectDB;