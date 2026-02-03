import { Router, Response } from 'express';
import { createInvestment, getInvestmentsByPortfolioId, updateInvestmentPrice, deleteInvestment } from '../models/Investment';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { getPortfolioById } from '../models/Portfolio';


const router = Router();

router.use(authMiddleware);

router.post('/:portfolioId/investments', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const userId = req.user!.id;

    // Verify portfolio ownership
    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const {
      assetType,
      name,
      quantity,
      purchasePrice,
      purchaseDate,
      symbol,
      notes,
      maturityDate,
      expectedReturn,
      metadata,
      currency,
      platform,
      isLiability,
      dividendYield,
      interestRate
    } = req.body;

    const investment = await createInvestment(
      portfolioId,
      assetType,
      name,
      quantity,
      purchasePrice,
      new Date(purchaseDate),
      symbol,
      notes,
      maturityDate ? new Date(maturityDate) : undefined,
      expectedReturn,
      metadata || {},
      currency || 'USD',
      platform,
      !!isLiability,
      dividendYield,
      interestRate
    );

    res.status(201).json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

router.get('/:portfolioId/investments', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const userId = req.user!.id;

    // Verify portfolio ownership
    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const investments = await getInvestmentsByPortfolioId(portfolioId);
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

router.post('/:portfolioId/investments/:investmentId/update-price', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const investmentId = req.params.investmentId as string;
    const { currentPrice } = req.body;
    const userId = req.user!.id;

    // Verify portfolio ownership
    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const investment = await updateInvestmentPrice(investmentId, currentPrice);
    res.json(investment);
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

router.delete('/:portfolioId/investments/:investmentId', async (req: AuthRequest, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId as string;
    const investmentId = req.params.investmentId as string;
    const userId = req.user!.id;

    // Verify portfolio ownership
    const portfolio = await getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const success = await deleteInvestment(investmentId, portfolioId);
    if (!success) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

export default router;
