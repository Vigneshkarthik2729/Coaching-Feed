const express = require("express");

const router = express.Router();

const Feed = require("../models/Feed");

const redisClient =
  require("../config/redis");

module.exports = (io) => {

  // GET FEEDS
  router.get("/", async (req, res) => {

    try {

      // CHECK CACHE
      const cachedFeeds =
        await redisClient.get("feeds");

      // RETURN CACHE
      if (cachedFeeds) {

        console.log("[GET /feed] FROM CACHE");

        return res.json(
          JSON.parse(cachedFeeds)
        );
      }

      console.log("[GET /feed] FROM DB");

      // FETCH FROM DB
      const feeds = await Feed.find()
        .sort({ createdAt: -1 });

      // STORE CACHE (non-blocking)
      redisClient.set(
        "feeds",
        JSON.stringify(feeds)
      ).catch(err => console.error("[Cache] Failed to set feeds:", err));

      res.json(feeds);

    } catch (error) {

      console.error("[GET /feed] Error:", error.message);
      res.status(500).json({
        message: error.message,
      });

    }
  });

  // POST FEED (Optimized for speed)
  router.post("/", async (req, res) => {

    try {

      console.log("[POST /feed] Request received");
      
      if (!req.body.title || !req.body.description) {
        return res.status(400).json({
          message: "Title and description are required",
        });
      }

      const startTime = Date.now();

      // Create feed immediately
      const feed = await Feed.create({
        title: req.body.title,
        description: req.body.description,
      });
      
      const dbTime = Date.now() - startTime;
      console.log(`[POST /feed] Feed created in MongoDB (${dbTime}ms)`);

      // SEND RESPONSE IMMEDIATELY (don't wait for cache/socket)
      res.status(201).json(feed);

      // Clear cache in background (non-blocking)
      redisClient.del("feeds")
        .then(() => console.log("[POST /feed] Cache cleared"))
        .catch(err => console.error("[Cache] Failed to clear:", err));

      // Emit event in background (non-blocking)
      setImmediate(() => {
        io.emit("newFeed", feed);
        console.log(`[POST /feed] Real-time event emitted`);
      });

    } catch (error) {

      console.error("[POST /feed] Error:", error.message);
      res.status(500).json({
        message: error.message,
      });

    }
  });

  // DELETE FEED
  router.delete("/:id", async (req, res) => {

    try {

      console.log(`[DELETE /feed/:id] Deleting feed: ${req.params.id}`);
      
      const feed = await Feed.findByIdAndDelete(req.params.id);
      
      if (!feed) {
        return res.status(404).json({
          message: "Feed not found",
        });
      }

      // SEND RESPONSE IMMEDIATELY
      res.status(200).json({
        message: "Feed deleted successfully",
        feedId: req.params.id,
      });

      // Clear cache in background (non-blocking)
      redisClient.del("feeds")
        .then(() => console.log("[DELETE /feed] Cache cleared"))
        .catch(err => console.error("[Cache] Failed to clear:", err));

      // Emit deletion event in background (non-blocking)
      setImmediate(() => {
        io.emit("deleteFeed", { feedId: req.params.id });
        console.log(`[DELETE /feed] Real-time deletion event emitted`);
      });

    } catch (error) {

      console.error("[DELETE /feed] Error:", error.message);
      res.status(500).json({
        message: error.message,
      });

    }
  });

  return router;
};