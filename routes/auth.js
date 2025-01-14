// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { generateToken } = require('../middleware/auth');
const User = require('../models/User');

router.post('/signin', async (req, res) => {
  try {
    const { lensProfileId, handle } = req.body;

    if (!lensProfileId || !handle) {
      return res.status(400).json({
        error: 'LensProfileId and handle are required'
      });
    }

    // Kullanıcıyı bul veya oluştur
    let user = await User.findOne({ lensProfileId });
    
    if (!user) {
      // Yeni kullanıcı oluştur
      user = new User({
        lensProfileId,
        handle,
        credits: 7  // Başlangıç kredisi
      });
      await user.save();
      console.log('New user created:', {
        lensProfileId,
        handle,
        credits: user.credits
      });
    }

    // JWT token oluştur
    const token = generateToken(lensProfileId);

    // Token'ı cookie olarak ayarla
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
    console.error('Signin error:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
    
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 0
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

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
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;