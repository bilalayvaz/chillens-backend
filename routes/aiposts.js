const express = require("express");
const Aipost = require("../models/Aipost");
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

router.get("/random", verifyToken, async (req, res) => {
  try {
    // Kullanıcı kredisi kontrolü
    const user = req.user;
    if (!user || user.credits <= 0) {
      return res.status(403).json({ message: "No credits available." });
    }

    if (user.lastPostTime) {
      const timeSinceLastPost = Date.now() - user.lastPostTime.getTime();
      const minimumWaitTime = 3 * 60 * 1000; // 3 dakika
      
      if (timeSinceLastPost < minimumWaitTime) {
        const remainingTime = Math.ceil((minimumWaitTime - timeSinceLastPost) / 1000);
        return res.status(429).json({ 
          message: "Please wait before creating another post",
          remainingTime,
          nextPostAvailableAt: new Date(user.lastPostTime.getTime() + minimumWaitTime)
        });
      }
    }

    const posts = await Aipost.find({ status: false });
    if (!posts.length) {
      return res.status(404).json({ message: "No available posts found." });
    }
    
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    res.json(randomPost);
  } catch (error) {
    console.error("Error in random post:", error);
    res.status(500).json({ message: "Error fetching random post.", error: error.message });
  }
});

// Status güncelleme endpoint'i
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const updatedPost = await Aipost.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post.", error });
  }
});

module.exports = router;
