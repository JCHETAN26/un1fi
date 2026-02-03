import { Router, Response } from 'express';
import { getPortfolioById } from '../models/Portfolio';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import AnalyticsService from '../services/AnalyticsService';
import pool from '../config/database';
import priceService from '../services/PriceService';

const router = Router();

// Public route for demo/historical chart
router.get('/history/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    const { rows } = await pool.query(
      `SELECT snapshot_date as date, net_worth as value, total_assets as assets, total_liabilities as liabilities
       FROM historical_snapshots 
       WHERE user_id = $1 
       ORDER BY snapshot_date ASC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/comparison/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;

    // 1. Get user history
    const { rows: userHistory } = await pool.query(
      `SELECT snapshot_date as date, net_worth as value
       FROM historical_snapshots 
       WHERE user_id = $1 
       ORDER BY snapshot_date ASC`,
      [userId]
    );

    if (userHistory.length < 2) {
      res.json([]);
      return;
    }

    // 2. Get SPY history for the same range
    const spyHistory = await priceService.getHistoricalPrices('SPY', '1mo');

    // 3. Normalize and compare
    const firstUserValue = parseFloat(userHistory[0].value);
    const firstSpyValue = spyHistory.length > 0 ? spyHistory[0].price : 0;

    const comparison = userHistory.map(uh => {
      const dateStr = new Date(uh.date).toISOString().split('T')[0];
      const spyPoint = spyHistory.find(s => s.date === dateStr) || spyHistory[spyHistory.length - 1];

      const userGrowth = ((parseFloat(uh.value) / firstUserValue) - 1) * 100;
      const spyGrowth = spyPoint ? ((spyPoint.price / firstSpyValue) - 1) * 100 : 0;

      return {
        date: dateStr,
        user: userGrowth,
        spy: spyGrowth
      };
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

router.use(authMiddleware);

router.get('/:portfolioId', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const userId = req.user!.id;

    // Verify portfolio ownership
    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const analytics = await AnalyticsService.calculatePortfolioMetrics(portfolioId);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/:portfolioId/premium', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const userId = req.user!.id;

    // Verify portfolio ownership
    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Check if user is premium (would check user.is_premium in production)
    const analytics = await AnalyticsService.generatePremiumAnalysis(portfolioId);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching premium analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});


export default router;
