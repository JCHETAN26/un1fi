import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'investment_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key_here_min_32_chars',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  // Third-party APIs
  apis: {
    alphaVantage: process.env.ALPHA_VANTAGE_KEY || '',
    finnhub: process.env.FINNHUB_KEY || '',
    coingecko: process.env.COINGECKO_KEY || '',
  },
};
