require('dotenv').config();

module.exports = {
  apps: [{
    name: 'chillens-api',
    script: 'index.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      FRONTEND_URL: process.env.FRONTEND_URL
    }
  }]
};