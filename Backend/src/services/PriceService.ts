import axios from 'axios';

export interface PriceData {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
  source: 'yahoo' | 'coingecko' | 'cache';
}

// Simple in-memory cache
const priceCache: Map<string, { data: PriceData; expires: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache

class PriceService {

  private getCached(key: string): PriceData | null {
    const cached = priceCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return { ...cached.data, source: 'cache' };
    }
    priceCache.delete(key);
    return null;
  }

  private setCache(key: string, data: PriceData): void {
    priceCache.set(key, { data, expires: Date.now() + CACHE_TTL });
  }

  // Yahoo Finance - works for stocks, ETFs, commodities
  async getYahooPrice(symbol: string): Promise<PriceData | null> {
    const cacheKey = `yahoo:${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Yahoo Finance v8 API (unofficial but stable)
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: { interval: '1d', range: '1d' },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }
      );

      const result = response.data.chart?.result?.[0];
      if (!result) return null;

      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const previousClose = meta.previousClose || meta.chartPreviousClose;

      const data: PriceData = {
        symbol,
        price,
        change: previousClose ? price - previousClose : undefined,
        changePercent: previousClose ? ((price - previousClose) / previousClose) * 100 : undefined,
        timestamp: new Date(),
        source: 'yahoo',
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching Yahoo price for ${symbol}:`, error);
      return null;
    }
  }

  // Stocks - use Yahoo Finance
  async getStockPrice(symbol: string): Promise<PriceData | null> {
    return this.getYahooPrice(symbol);
  }

  // Gold & Silver - use Yahoo Finance futures
  async getGoldPrice(): Promise<PriceData | null> {
    return this.getYahooPrice('GC=F'); // Gold futures
  }

  async getSilverPrice(): Promise<PriceData | null> {
    return this.getYahooPrice('SI=F'); // Silver futures
  }

  // Crypto - use CoinGecko (free, no API key)
  async getCryptocurrencyPrice(coinId: string): Promise<PriceData | null> {
    const cacheKey = `coingecko:${coinId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: coinId.toLowerCase(),
            vs_currencies: 'usd',
            include_24hr_change: true,
          },
          timeout: 10000,
        }
      );

      const coinData = response.data[coinId.toLowerCase()];
      if (!coinData) return null;

      const data: PriceData = {
        symbol: coinId,
        price: coinData.usd,
        changePercent: coinData.usd_24h_change,
        timestamp: new Date(),
        source: 'coingecko',
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching crypto price for ${coinId}:`, error);
      return null;
    }
  }

  // Get multiple crypto prices at once
  async getMultipleCryptoPrices(coinIds: string[]): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const id of coinIds) {
      const cached = this.getCached(`coingecko:${id}`);
      if (cached) {
        results.set(id, cached);
      } else {
        uncachedIds.push(id);
      }
    }

    if (uncachedIds.length === 0) return results;

    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: uncachedIds.join(','),
            vs_currencies: 'usd',
            include_24hr_change: true,
          },
          timeout: 10000,
        }
      );

      for (const id of uncachedIds) {
        const coinData = response.data[id.toLowerCase()];
        if (coinData) {
          const data: PriceData = {
            symbol: id,
            price: coinData.usd,
            changePercent: coinData.usd_24h_change,
            timestamp: new Date(),
            source: 'coingecko',
          };
          this.setCache(`coingecko:${id}`, data);
          results.set(id, data);
        }
      }
    } catch (error) {
      console.error('Error fetching multiple crypto prices:', error);
    }

    return results;
  }

  // Commodity mapping
  async getCommodityPrice(commodity: string): Promise<PriceData | null> {
    const commoditySymbols: Record<string, string> = {
      gold: 'GC=F',
      silver: 'SI=F',
      platinum: 'PL=F',
      palladium: 'PA=F',
      oil: 'CL=F',
      'crude oil': 'CL=F',
      'natural gas': 'NG=F',
    };

    const symbol = commoditySymbols[commodity.toLowerCase()];
    if (!symbol) {
      console.warn(`Unknown commodity: ${commodity}`);
      return null;
    }

    return this.getYahooPrice(symbol);
  }

  // Get price by asset type
  async getPrice(assetType: string, symbol: string): Promise<PriceData | null> {
    switch (assetType.toLowerCase()) {
      case 'stocks':
      case 'stock':
        return this.getStockPrice(symbol);
      case 'crypto':
      case 'cryptocurrency':
        return this.getCryptocurrencyPrice(symbol);
      case 'gold':
        return this.getGoldPrice();
      case 'silver':
        return this.getSilverPrice();
      case 'commodities':
      case 'commodity':
        return this.getCommodityPrice(symbol);
      default:
        return null;
    }
  }

  // Get historical prices for comparison
  async getHistoricalPrices(symbol: string, range: string = '1mo'): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: { interval: '1d', range },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }
      );

      const result = response.data.chart?.result?.[0];
      if (!result) return [];

      const timestamps = result.timestamp;
      const prices = result.indicators.quote[0].close;

      return timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        price: prices[i]
      })).filter((item: any) => item.price !== null);
    } catch (error) {
      console.error(`Error fetching history for ${symbol}:`, error);
      return [];
    }
  }
}

export default new PriceService();
