// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    // Token'ı cookie'den al
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Token'ı verify et
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findOne({ lensProfileId: decoded.lensProfileId });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const generateToken = (lensProfileId) => {
  return jwt.sign({ lensProfileId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { verifyToken, generateToken };