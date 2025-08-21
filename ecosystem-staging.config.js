module.exports = {
  apps: [
    // Staging API
    {
      name: 'songiq-api-staging',
      script: 'server/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 5000
      },
      error_file: './logs/staging-api-error.log',
      out_file: './logs/staging-api-out.log',
      log_file: './logs/staging-api-combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs']
    },

    // Staging Client
    {
      name: 'songiq-client-staging',
      script: 'npm',
      args: 'run preview',
      cwd: './client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging'
      },
      error_file: './logs/staging-client-error.log',
      out_file: './logs/staging-client-out.log',
      log_file: './logs/staging-client-combined.log',
      time: true,
      watch: false
    }
  ]
};
