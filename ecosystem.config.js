module.exports = {
  apps: [
    // Staging API
    {
      name: 'songiq-api-staging',
      script: 'songiq/server/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 5001
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001
      },
      error_file: './logs/staging-api-error.log',
      out_file: './logs/staging-api-out.log',
      log_file: './logs/staging-api-combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs']
    },

    // Production API
    {
      name: 'songiq-api',
      script: 'songiq/server/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/production-api-error.log',
      out_file: './logs/production-api-out.log',
      log_file: './logs/production-api-combined.log',
      time: true,
      max_memory_restart: '2G',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      // Production-specific settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    },

    // Staging Client
    {
      name: 'songiq-client-staging',
      script: 'npm',
      args: 'run preview',
      cwd: './songiq/client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging'
      },
      env_staging: {
        NODE_ENV: 'staging'
      },
      error_file: './logs/staging-client-error.log',
      out_file: './logs/staging-client-out.log',
      log_file: './logs/staging-client-combined.log',
      time: true,
      watch: false
    },

    // Production Client
    {
      name: 'songiq-client',
      script: 'npm',
      args: 'run preview',
      cwd: './songiq/client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/production-client-error.log',
      out_file: './logs/production-client-out.log',
      log_file: './logs/production-client-combined.log',
      time: true,
      watch: false
    }
  ],

  deploy: {
    staging: {
      user: 'deploy',
      host: 'staging.songiq.com',
      ref: 'origin/staging',
      repo: 'https://github.com/YOUniversalIdeas/songIQ.git',
      path: '/var/www/songiq-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm run install:all && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    },
    production: {
      user: 'deploy',
      host: 'songiq.ai',
      ref: 'origin/main',
      repo: 'https://github.com/YOUniversalIdeas/songIQ.git',
      path: '/var/www/songiq',
      'pre-deploy-local': '',
      'post-deploy': 'npm run install:all && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 