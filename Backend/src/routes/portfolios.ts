import { Router, Response } from 'express';
import { createPortfolio, getPortfoliosByUserId, getPortfolioById } from '../models/Portfolio';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import AnalyticsService from '../services/AnalyticsService';

const router = Router();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.id;

    if (!name) {
      res.status(400).json({ error: 'Portfolio name is required' });
      return;
    }

    const portfolio = await createPortfolio(userId, name, description);
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const portfolios = await getPortfoliosByUserId(userId);
    res.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

router.get('/:portfolioId', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const userId = req.user!.id;

    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Get analytics
    const analytics = await AnalyticsService.calculatePortfolioMetrics(portfolioId);

    res.json({
      portfolio,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

export default router;
