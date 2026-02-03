// Stock search service using Yahoo Finance autocomplete API

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

// Cache search results
const searchCache: Map<string, { results: StockSearchResult[]; expires: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 1) return [];
  
  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.results;
  }

  try {
    // Yahoo Finance autocomplete API
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&listsCount=0`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    
    const results: StockSearchResult[] = (data.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || '',
        type: q.quoteType === 'ETF' ? 'ETF' : 'Stock',
      }));

    searchCache.set(cacheKey, { results, expires: Date.now() + CACHE_TTL });
    return results;
  } catch (error) {
    console.error('Stock search error:', error);
    return [];
  }
}

// Popular stocks for quick selection
export const popularStocks: StockSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', exchange: 'NYSE', type: 'Stock' },
];

// Popular crypto for quick selection
export const popularCryptos = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
];

// Search crypto using CoinGecko
export async function searchCrypto(query: string): Promise<typeof popularCryptos> {
  if (!query || query.length < 1) return popularCryptos;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Crypto search failed');
    
    const data = await response.json();
    
    return (data.coins || []).slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
    }));
  } catch (error) {
    console.error('Crypto search error:', error);
    // Return filtered popular cryptos as fallback
    const q = query.toLowerCase();
    return popularCryptos.filter(
      c => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }
}
