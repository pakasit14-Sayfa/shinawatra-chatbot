module.exports = {
  apps: [
    {
      name: 'plu-chatbot',
      script: 'server.js',
      cwd: 'C:\\Dilion\\Theme_UI_extracted\\Guidance teacher system\\backend-middleware',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
      },
      // Log settings
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: 'C:\\Dilion\\Theme_UI_extracted\\Guidance teacher system\\backend-middleware\\logs\\out.log',
      error_file: 'C:\\Dilion\\Theme_UI_extracted\\Guidance teacher system\\backend-middleware\\logs\\err.log',
      merge_logs: true,
    },
  ],
};
