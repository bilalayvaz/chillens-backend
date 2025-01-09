// routes/auth.js
const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/auth');
const User = require('../models/User');

router.post('/signin', async (req, res) => {
  try {
    const { lensProfileId, handle } = req.body;

    // JWT token oluştur
    const token = generateToken(lensProfileId);

    // Token'ı cookie olarak ayarla
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
    });

    // Kullanıcı varsa bilgilerini, yoksa sadece token'ı dön
    const user = await User.findOne({ lensProfileId });
    
    res.json({
      success: true,
      user: user ? {
        lensProfileId: user.lensProfileId,
        handle: user.handle,
        credits: user.credits
      } : null
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/verify', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ lensProfileId: decoded.lensProfileId });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ 
      valid: true,
      user: {
        lensProfileId: user.lensProfileId,
        handle: user.handle,
        credits: user.credits
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;