const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { generateToken } = require('../middleware/auth');
const User = require('../models/User');

// Cookie ayarlarını bir yerde topluyoruz
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
});

router.post('/signin', async (req, res) => {
  try {
    const { lensProfileId, handle } = req.body;

    // Gelen verileri kontrol et
    if (!lensProfileId || !handle) {
      console.log('Missing required fields:', { lensProfileId, handle });
      return res.status(400).json({
        error: 'LensProfileId and handle are required'
      });
    }

    // Kullanıcıyı bul veya oluştur
    let user = await User.findOne({ lensProfileId });
    
    if (!user) {
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

    // Token oluştur
    const token = generateToken(lensProfileId);
    console.log('Token generated for user:', {
      lensProfileId,
      tokenPreview: token.substring(0, 10) + '...'
    });

    // Cookie'yi ayarla
    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);
    console.log('Cookie set with options:', cookieOptions);

    // Başarılı response dön
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
      message: error.message,
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
    // Cookie'yi sil
    res.cookie('token', '', {
      ...getCookieOptions(),
      maxAge: 0
    });
    
    console.log('User logged out successfully');
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
      console.log('No token found in verify request');
      return res.status(401).json({ error: 'No token provided' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for lensProfileId:', decoded.lensProfileId);

    // Kullanıcıyı bul
    const user = await User.findOne({ lensProfileId: decoded.lensProfileId });
    
    if (!user) {
      console.log('User not found for lensProfileId:', decoded.lensProfileId);
      return res.status(401).json({ error: 'User not found' });
    }

    // Başarılı response dön
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

// Geliştirme ortamında token kontrolü için endpoint
if (process.env.NODE_ENV === 'development') {
  router.get('/debug-token', (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.json({ 
          hasToken: false,
          message: 'No token found in cookies'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        hasToken: true,
        tokenPreview: token.substring(0, 10) + '...',
        decoded
      });
    } catch (error) {
      res.json({
        hasToken: true,
        error: error.message
      });
    }
  });
}

module.exports = router;