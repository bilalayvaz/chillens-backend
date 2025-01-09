// deployment/ecosystem.config.js

module.exports = {
    apps: [{
      name: 'chillens-api',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env_production: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '/var/log/pm2/chillens-api.log',
      error_file: '/var/log/pm2/chillens-api-error.log',
    }]
  }