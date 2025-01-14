require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const app = express();
const port = process.env.PORT || 3000;

// cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Middleware
const { setupSecurity } = require('./middleware/security');
setupSecurity(app);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
  maxAge: 86400
}));

/* app.use(cors({
  origin: 'http://localhost:3000', // Next.js frontend adresiniz
  credentials: true
})); */

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const paymentRoutes = require('./routes/payments');
const aipostRoutes = require('./routes/aiposts');
const healthRoutes = require('./routes/health');

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/aiposts', aipostRoutes);
app.use('/api/health', healthRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI,{
  maxPoolSize: 25, 
  minPoolSize: 5,  
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  family: 4
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Bağlantı durumunu izlemek için
mongoose.connection.on('connected', () => {
console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
console.log('Mongoose disconnected');
});

// Uygulama kapandığında bağlantıyı düzgün şekilde kapat
process.on('SIGINT', async () => {
await mongoose.connection.close();
process.exit(0);
});
