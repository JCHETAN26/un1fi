import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolios';
import investmentRoutes from './routes/investments';
import analyticsRoutes from './routes/analytics';
import pricesRoutes from './routes/prices';

const app: Express = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all for demo/development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prices', pricesRoutes);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  try {
    await initializeDatabase();

    // Start background workers
    const { default: priceSyncWorker } = await import('./services/PriceSyncWorker');
    priceSyncWorker.start(); // Run every 30 mins

    app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
