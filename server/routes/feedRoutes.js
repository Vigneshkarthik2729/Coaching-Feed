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

        console.log("FROM CACHE");

        return res.json(
          JSON.parse(cachedFeeds)
        );
      }

      console.log("FROM DB");

      // FETCH FROM DB
      const feeds = await Feed.find()
        .sort({ createdAt: -1 });

      // STORE CACHE
      await redisClient.set(
        "feeds",
        JSON.stringify(feeds)
      );

      res.json(feeds);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  });

  // POST FEED
  router.post("/", async (req, res) => {

    try {

      const feed = await Feed.create({
        title: req.body.title,
        description:
          req.body.description,
      });

      // CLEAR CACHE
      await redisClient.del("feeds");

      // REALTIME EVENT
      io.emit("newFeed", feed);

      res.status(201).json(feed);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  });

  return router;
};