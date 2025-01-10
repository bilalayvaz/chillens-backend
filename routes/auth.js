// routes/auth.js

const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/auth');
const User = require('../models/User');

router.post('/signin', async (req, res) => {
  try {
    const { lensProfileId, handle } = req.body;

    // Kullanıcıyı bul veya oluştur
    let user = await User.findOne({ lensProfileId });
    
    if (!user) {
      user = new User({
        lensProfileId,
        handle,
        credits: 7
      });
      await user.save();
      console.log('New user created:', user);
    }

    // JWT token oluştur
    const token = generateToken(lensProfileId);

    // Cookie ayarları
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
    });

    res.json({
      success: true,
      user: {
        lensProfileId: user.lensProfileId,
        handle: user.handle,
        credits: user.credits
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});

// Logout route'unu da güncelleyelim
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 0
  });
  res.json({ success: true });
});

module.exports = router;