module.exports = {
  apps: [{
    name: 'hivetalk',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hivetalk',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/hivetalk/logs/error.log',
    out_file: '/var/www/hivetalk/logs/out.log',
    log_file: '/var/www/hivetalk/logs/combined.log',
    time: true
  }]
};
