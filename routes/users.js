// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Protected - Kullanıcı getir veya oluştur
router.post('/get-or-create', verifyToken, async (req, res) => {
  const { lensProfileId, handle } = req.body;

  try {
    // Token'dan gelen kullanıcı ile gelen id eşleşmeli
    if (req.user.lensProfileId !== lensProfileId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let user = await User.findOne({ lensProfileId });
    if (!user) {
      user = new User({
        lensProfileId,
        handle,
        credits: 7
      });    
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected - Kredi kullan
router.post('/use-credit', verifyToken, async (req, res) => {
  const { lensProfileId } = req.body;

  try {
    if (req.user.lensProfileId !== lensProfileId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ lensProfileId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits <= 0) {
      return res.status(400).json({ error: 'No credits available' });
    }

    user.credits -= 1;
    user.totalCreditsUsed += 1;
    user.lastPostTime = new Date(); // Burayı ekleyelim
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected - İstatistikleri getir
router.get('/stats/:lensProfileId', verifyToken, async (req, res) => {
  try {
    // Token'dan gelen kullanıcı ile istenilen profil eşleşmeli
    if (req.user.lensProfileId !== req.params.lensProfileId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ lensProfileId: req.params.lensProfileId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = {
      currentCredits: user.credits,
      totalUsed: user.totalCreditsUsed,
      totalPurchased: user.totalCreditsPurchased
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;