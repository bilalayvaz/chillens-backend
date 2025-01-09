// middleware/security.js
const rateLimit = require('express-rate-limit')
const cors = require('cors')


// Rate limiter ayarları
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 75, // Her IP için 15 dakikada max 100 istek
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Özel rate limiter (auth işlemleri için)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // Her IP için saatte 5 deneme
  message: 'Too many auth attempts, please try again later.'
})

//post limiti
const postLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 dakika
  max: 1, // 3 dakikada max 1 post
  message: 'Please wait before creating another post'
})

// CORS ayarları
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400 // CORS preflight cache - 24 saat
};


const setupSecurity = (app) => {
  // CORS'u etkinleştir
  app.use(cors(corsOptions))

  // Global rate limiter
  app.use(limiter)

  // Auth route'ları için özel rate limiter
  app.use('/api/auth/*', authLimiter)

  app.use('/api/aiposts/random', postLimiter)
}

module.exports = { setupSecurity }