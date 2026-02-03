import { useState, useEffect } from 'react';
import { MobileHeader } from '@/components/MobileHeader';
import { MobilePortfolioSummary } from '@/components/MobilePortfolioSummary';
import { MobileQuickStats } from '@/components/MobileQuickStats';
import { MobileAllocationChart } from '@/components/MobileAllocationChart';
import { MobileAssetList } from '@/components/MobileAssetList';
import { MobilePremiumBanner } from '@/components/MobilePremiumBanner';
import { LiveMarketPrices } from '@/components/LiveMarketPrices';
import { HistoricalNetWorthChart } from '@/components/HistoricalNetWorthChart';
import { BottomNav } from '@/components/BottomNav';
import { investmentApi } from '@/lib/api';
import { priceService } from '@/lib/priceService';
import { Asset } from '@/types/portfolio';
import { mockAssets, calculatePortfolioSummary, calculateAllocation } from '@/data/mockPortfolio';
import { calculateRealPortfolioMetrics } from '@/lib/calculationUtils';
import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [priceUpdateStatus, setPriceUpdateStatus] = useState<'idle' | 'updating' | 'done' | 'error'>('idle');

  useEffect(() => {
    loadAssets();
  }, []);

  // Auto-refresh prices every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (assets.length > 0) {
        updateLivePrices(assets);
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [assets]);

  const loadAssets = async () => {
    try {
      const data = await investmentApi.getAssets();

      const transformedAssets: Asset[] = data.map((item: any) => ({
        id: item.id || item._id || `${Date.now()}_${Math.random()}`,
        name: item.name,
        symbol: item.symbol || item.platform || '',
        category: item.category || item.assetType,
        quantity: parseFloat(item.quantity) || 1,
        purchasePrice: parseFloat(item.purchasePrice) || 0,
        currentPrice: parseFloat(item.currentPrice) || parseFloat(item.purchasePrice) || 0,
        previousClose: parseFloat(item.previousClose) || parseFloat(item.purchasePrice) || 0,
        currency: item.currency || 'USD',
        platform: item.platform || item.symbol || '',
        lastUpdated: new Date(item.updatedAt || item.purchaseDate || Date.now()),
        maturityDate: item.maturityDate,
        interestRate: item.interestRate || item.expectedReturn,
      }));

      if (transformedAssets.length > 0) {
        setAssets(transformedAssets);
        // Immediately fetch live prices
        await updateLivePrices(transformedAssets);
      } else {
        setAssets(mockAssets);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live prices for all assets
  const updateLivePrices = async (currentAssets: Asset[]) => {
    setPriceUpdateStatus('updating');

    try {
      const updatedAssets = await Promise.all(
        currentAssets.map(async (asset) => {
          const category = asset.category.toLowerCase();
          let priceData = null;
          const symbol = (asset as any).symbol || asset.platform;

          if (category === 'stocks' && symbol) {
            priceData = await priceService.getStockPrice(symbol);
          } else if (category === 'crypto' && symbol) {
            priceData = await priceService.getCryptoPrice(symbol);
          } else if (category === 'gold') {
            priceData = await priceService.getGoldPrice();
          } else if (category === 'silver') {
            priceData = await priceService.getSilverPrice();
          }

          if (priceData) {
            const previousClose = priceData.change
              ? priceData.price - priceData.change
              : (asset as any).previousClose || asset.purchasePrice;

            return {
              ...asset,
              currentPrice: priceData.price,
              previousClose: previousClose,
              lastUpdated: new Date(),
            };
          }
          return asset;
        })
      );

      setAssets(updatedAssets);
      setLastPriceUpdate(new Date());
      setPriceUpdateStatus('done');
    } catch (error) {
      console.error('Failed to update prices:', error);
      setPriceUpdateStatus('error');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssets();
    setRefreshing(false);
  };

  // Calculate REAL portfolio summary with live prices
  const metrics = calculateRealPortfolioMetrics(assets);

  const dailyChange = assets.reduce((sum, a) => {
    const prevValue = ((a as any).previousClose || a.purchasePrice) * a.quantity;
    const currValue = a.currentPrice * a.quantity;
    const change = currValue - prevValue;
    return a.isLiability || a.category === 'liabilities' ? sum - change : sum + change;
  }, 0);

  const dailyChangePercentage = (metrics.netWorth - dailyChange) !== 0
    ? (dailyChange / Math.abs(metrics.netWorth - dailyChange)) * 100
    : 0;

  const summary = assets.length > 0 ? {
    totalValue: metrics.netWorth,
    totalAssets: metrics.totalValue,
    totalLiabilities: metrics.liabilities,
    totalGain: metrics.totalGain,
    totalGainPercentage: metrics.totalGainPercentage,
    dailyChange,
    dailyChangePercentage,
    assetCount: assets.length,
  } : calculatePortfolioSummary(assets);

  const allocation = calculateAllocation(assets);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />

      {/* Price Update Status Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {priceUpdateStatus === 'updating' ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                <span className="text-muted-foreground">Updating prices...</span>
              </>
            ) : priceUpdateStatus === 'done' ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">
                  Live prices • {lastPriceUpdate?.toLocaleTimeString()}
                </span>
              </>
            ) : priceUpdateStatus === 'error' ? (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-muted-foreground">Price update failed</span>
              </>
            ) : null}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-primary"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <main className="space-y-6">
        <MobilePortfolioSummary summary={summary} />
        <div className="px-4">
          <HistoricalNetWorthChart />
        </div>
        <LiveMarketPrices />
        <MobileQuickStats assets={assets} />
        <MobileAllocationChart data={allocation} />
        <MobilePremiumBanner />
        <MobileAssetList assets={assets} />
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;