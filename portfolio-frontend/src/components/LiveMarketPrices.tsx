import { useEffect, useState } from 'react';
import { priceService, PriceData } from '@/lib/priceService';
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';

interface MarketPrice {
  name: string;
  symbol: string;
  type: 'stock' | 'crypto' | 'commodity';
  price?: number;
  change?: number;
  loading: boolean;
}

const initialMarkets: MarketPrice[] = [
  { name: 'Apple', symbol: 'AAPL', type: 'stock', loading: true },
  { name: 'Gold', symbol: 'GC=F', type: 'commodity', loading: true },
  { name: 'Silver', symbol: 'SI=F', type: 'commodity', loading: true },
  { name: 'Bitcoin', symbol: 'bitcoin', type: 'crypto', loading: true },
  { name: 'Ethereum', symbol: 'ethereum', type: 'crypto', loading: true },
];

export const LiveMarketPrices = () => {
  const [markets, setMarkets] = useState<MarketPrice[]>(initialMarkets);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    setRefreshing(true);
    
    const updatedMarkets = await Promise.all(
      markets.map(async (market) => {
        try {
          let data: PriceData | null = null;
          
          if (market.type === 'stock' || market.type === 'commodity') {
            data = await priceService.getStockPrice(market.symbol);
          } else if (market.type === 'crypto') {
            data = await priceService.getCryptoPrice(market.symbol);
          }
          
          return {
            ...market,
            price: data?.price,
            change: data?.changePercent,
            loading: false,
          };
        } catch {
          return { ...market, loading: false };
        }
      })
    );
    
    setMarkets(updatedMarkets);
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number | undefined, type: string) => {
    if (!price) return '—';
    if (type === 'crypto' && price > 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="px-4">
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Live Markets</h3>
          <button 
            onClick={fetchPrices} 
            disabled={refreshing}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-2">
          {markets.map((market) => (
            <div 
              key={market.symbol}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded font-medium">
                  {market.type === 'crypto' ? '₿' : market.type === 'commodity' ? '🥇' : '📈'}
                </span>
                <span className="font-medium text-sm">{market.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {market.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <span className="font-semibold text-sm">
                      {formatPrice(market.price, market.type)}
                    </span>
                    {market.change !== undefined && (
                      <span className={`flex items-center text-xs font-medium ${
                        market.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {market.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-0.5" />
                        )}
                        {Math.abs(market.change).toFixed(2)}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {lastUpdated && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};
