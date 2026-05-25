export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3002,http://localhost:3003,http://127.0.0.1:3001,http://127.0.0.1:2378').split(','),
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5242880,
  },
  ai: {
    apiKey: process.env.AI_API_KEY || process.env.DASHSCOPE_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1/chat/completions',
    model: process.env.AI_MODEL || 'deepseek-chat',
  },
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY || '',
});
