module.exports = {
  apps: [
    {
      name: 'plu-chatbot',
      script: 'server.js',
      cwd: 'c:\\Dilion\\dify-webhook-middleware',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
      },
      // Log settings
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: 'c:\\Dilion\\dify-webhook-middleware\\logs\\out.log',
      error_file: 'c:\\Dilion\\dify-webhook-middleware\\logs\\err.log',
      merge_logs: true,
    },
  ],
};
