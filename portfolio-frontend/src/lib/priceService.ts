// Frontend Price Service - fetches real prices directly
// Uses Yahoo Finance for stocks/commodities, CoinGecko for crypto

export interface PriceData {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
}

// Simple cache to avoid hammering APIs
const cache: Map<string, { data: PriceData; expires: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

function getCached(key: string): PriceData | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: PriceData): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

// Yahoo Finance proxy (using a CORS proxy for frontend)
async function fetchYahooPrice(symbol: string): Promise<PriceData | null> {
  const cacheKey = `yahoo:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Use allorigins.win as CORS proxy for Yahoo Finance
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;
    
    const response = await fetch(proxyUrl, { 
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Yahoo fetch failed');
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;

    const priceData: PriceData = {
      symbol,
      price,
      change: previousClose ? price - previousClose : undefined,
      changePercent: previousClose ? ((price - previousClose) / previousClose) * 100 : undefined,
      timestamp: new Date(),
    };

    setCache(cacheKey, priceData);
    return priceData;
  } catch (error) {
    console.error(`Error fetching Yahoo price for ${symbol}:`, error);
    return null;
  }
}

// CoinGecko - no CORS issues
async function fetchCryptoPrice(coinId: string): Promise<PriceData | null> {
  const cacheKey = `crypto:${coinId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) throw new Error('CoinGecko fetch failed');
    
    const data = await response.json();
    const coinData = data[coinId.toLowerCase()];
    if (!coinData) return null;

    const priceData: PriceData = {
      symbol: coinId,
      price: coinData.usd,
      changePercent: coinData.usd_24h_change,
      timestamp: new Date(),
    };

    setCache(cacheKey, priceData);
    return priceData;
  } catch (error) {
    console.error(`Error fetching crypto price for ${coinId}:`, error);
    return null;
  }
}

// Symbol mappings
const CRYPTO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
};

const COMMODITY_SYMBOLS: Record<string, string> = {
  'gold': 'GC=F',
  'silver': 'SI=F',
  'platinum': 'PL=F',
  'oil': 'CL=F',
};

// Public API
export const priceService = {
  async getStockPrice(symbol: string): Promise<PriceData | null> {
    return fetchYahooPrice(symbol.toUpperCase());
  },

  async getGoldPrice(): Promise<PriceData | null> {
    return fetchYahooPrice('GC=F');
  },

  async getSilverPrice(): Promise<PriceData | null> {
    return fetchYahooPrice('SI=F');
  },

  async getCryptoPrice(symbol: string): Promise<PriceData | null> {
    const coinId = CRYPTO_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
    return fetchCryptoPrice(coinId);
  },

  async getCommodityPrice(commodity: string): Promise<PriceData | null> {
    const symbol = COMMODITY_SYMBOLS[commodity.toLowerCase()];
    if (!symbol) return null;
    return fetchYahooPrice(symbol);
  },

  // Get price based on asset category
  async getPrice(category: string, symbol: string): Promise<PriceData | null> {
    switch (category.toLowerCase()) {
      case 'stocks':
        return this.getStockPrice(symbol);
      case 'crypto':
        return this.getCryptoPrice(symbol);
      case 'gold':
        return this.getGoldPrice();
      case 'silver':
        return this.getSilverPrice();
      case 'commodities':
        return this.getCommodityPrice(symbol);
      default:
        return null;
    }
  },

  // Fetch multiple prices at once
  async getMultiplePrices(
    assets: Array<{ category: string; symbol: string }>
  ): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>();

    await Promise.all(
      assets.map(async ({ category, symbol }) => {
        const price = await this.getPrice(category, symbol);
        if (price) {
          results.set(`${category}:${symbol}`, price);
        }
      })
    );

    return results;
  },
};

export default priceService;
