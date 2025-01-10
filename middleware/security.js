const rateLimit = require('express-rate-limit')

// Rate limiter ayarları
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // IP tabanlı rate limiting için güvenli ayarlar
  keyGenerator: (req) => {
    // X-Real-IP header'ını kullan (Caddy'den geliyor)
    return req.headers['x-real-ip'] || req.ip;
  }
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-real-ip'] || req.ip;
  }
});

// Post rate limiter
const postLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 dakika
  max: 10, // 3 dakikada 10 istek
  keyGenerator: (req) => {
    const identifier = req.headers['x-real-ip'] || req.ip;
    const lensProfileId = req.body?.lensProfileId || 'anonymous';
    return `${identifier}-${lensProfileId}`; // Kullanıcı bazlı limit
  }
});

const setupSecurity = (app) => {
  app.set('trust proxy', 'loopback'); // Sadece localhost'tan gelen proxy'lere güven
  
  app.use(limiter);
  app.use('/api/auth/*', authLimiter);
  app.use('/api/aiposts/random', postLimiter);
};

module.exports = { setupSecurity };