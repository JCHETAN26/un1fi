import { Router, Request, Response } from 'express';
import PriceService from '../services/PriceService';

const router = Router();

// GET /api/prices/stock/:symbol - Get stock price
router.get('/stock/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const price = await PriceService.getStockPrice(symbol.toUpperCase());

    if (!price) {
      res.status(404).json({ error: `Price not found for ${symbol}` });
      return;
    }

    res.json(price);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
});

// GET /api/prices/crypto/:coinId - Get crypto price
router.get('/crypto/:coinId', async (req: Request, res: Response) => {
  try {
    const coinId = req.params.coinId as string;
    const price = await PriceService.getCryptocurrencyPrice(coinId.toLowerCase());

    if (!price) {
      res.status(404).json({ error: `Price not found for ${coinId}` });
      return;
    }

    res.json(price);
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    res.status(500).json({ error: 'Failed to fetch crypto price' });
  }
});

// GET /api/prices/gold - Get gold price
router.get('/gold', async (_req: Request, res: Response) => {
  try {
    const price = await PriceService.getGoldPrice();

    if (!price) {
      res.status(404).json({ error: 'Gold price not available' });
      return;
    }

    res.json(price);
  } catch (error) {
    console.error('Error fetching gold price:', error);
    res.status(500).json({ error: 'Failed to fetch gold price' });
  }
});

// GET /api/prices/silver - Get silver price
router.get('/silver', async (_req: Request, res: Response) => {
  try {
    const price = await PriceService.getSilverPrice();

    if (!price) {
      res.status(404).json({ error: 'Silver price not available' });
      return;
    }

    res.json(price);
  } catch (error) {
    console.error('Error fetching silver price:', error);
    res.status(500).json({ error: 'Failed to fetch silver price' });
  }
});

// GET /api/prices/commodity/:name - Get commodity price
router.get('/commodity/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name as string;
    const price = await PriceService.getCommodityPrice(name);

    if (!price) {
      res.status(404).json({ error: `Price not found for ${name}` });
      return;
    }

    res.json(price);
  } catch (error) {
    console.error('Error fetching commodity price:', error);
    res.status(500).json({ error: 'Failed to fetch commodity price' });
  }
});

// POST /api/prices/batch - Get multiple prices at once
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { assets } = req.body;

    if (!Array.isArray(assets)) {
      res.status(400).json({ error: 'assets must be an array' });
      return;
    }

    const results: Record<string, any> = {};

    await Promise.all(
      assets.map(async (asset: { type: string; symbol: string }) => {
        const price = await PriceService.getPrice(asset.type, asset.symbol);
        if (price) {
          results[`${asset.type}:${asset.symbol}`] = price;
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching batch prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

export default router;
