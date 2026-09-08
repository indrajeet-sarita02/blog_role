module.exports = {
  apps: [
    {
      name: 'blog-frontend',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
        JWT_SECRET: 'change-me-to-a-long-random-string',
      },
      max_memory_restart: '500M',
      instances: 1,
      autorestart: true,
      restart_delay: 3000,
      kill_timeout: 10000,
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};