import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { investmentApi } from '@/lib/api';
import { priceService } from '@/lib/priceService';
import { Asset } from '@/types/portfolio';
import { mockAssets } from '@/data/mockPortfolio';
import { 
  ChevronLeft, TrendingUp, TrendingDown, RefreshCw, Trash2, 
  Edit3, Bell, ExternalLink, Calendar, DollarSign, Hash,
  Building2, Coins, Bitcoin, Landmark, PiggyBank, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const categoryIcons: Record<string, React.ElementType> = {
  stocks: TrendingUp,
  gold: Coins,
  silver: Coins,
  crypto: Bitcoin,
  real_estate: Building2,
  fixed_income: Landmark,
  cash: PiggyBank,
};

const categoryColors: Record<string, string> = {
  stocks: 'bg-blue-500',
  gold: 'bg-yellow-500',
  silver: 'bg-gray-400',
  crypto: 'bg-orange-500',
  real_estate: 'bg-purple-500',
  fixed_income: 'bg-green-500',
  cash: 'bg-gray-600',
};

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAsset();
  }, [id]);

  const loadAsset = async () => {
    try {
      const assets = await investmentApi.getAssets();
      let found = assets.find((a: any) => a.id === id);
      
      if (!found) {
        // Try mock data
        found = mockAssets.find(a => a.id === id);
      }

      if (found) {
        setAsset({
          id: found.id,
          name: found.name,
          category: found.category || found.assetType,
          quantity: parseFloat(found.quantity) || 1,
          purchasePrice: parseFloat(found.purchasePrice) || 0,
          currentPrice: parseFloat(found.currentPrice) || parseFloat(found.purchasePrice) || 0,
          currency: found.currency || 'USD',
          platform: found.platform || found.symbol || '',
          lastUpdated: new Date(found.updatedAt || found.purchaseDate || Date.now()),
          maturityDate: found.maturityDate,
          interestRate: found.interestRate || found.expectedReturn,
        });
      }
    } catch (error) {
      console.error('Failed to load asset:', error);
      // Try mock data
      const found = mockAssets.find(a => a.id === id);
      if (found) setAsset(found);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrice = async () => {
    if (!asset) return;
    setRefreshing(true);
    
    try {
      let price = null;
      
      if (asset.category === 'stocks' && asset.platform) {
        price = await priceService.getStockPrice(asset.platform);
      } else if (asset.category === 'crypto') {
        price = await priceService.getCryptoPrice(asset.name.toLowerCase());
      } else if (asset.category === 'gold') {
        price = await priceService.getGoldPrice();
      } else if (asset.category === 'silver') {
        price = await priceService.getSilverPrice();
      }

      if (price?.price) {
        setAsset({ ...asset, currentPrice: price.price, lastUpdated: new Date() });
        await investmentApi.updatePrice(asset.id, price.price);
        toast.success(`Price updated: $${price.price.toLocaleString()}`);
      } else {
        toast.error('Could not fetch latest price');
      }
    } catch (error) {
      console.error('Failed to refresh price:', error);
      toast.error('Failed to update price');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    setDeleting(true);
    
    try {
      await investmentApi.deleteInvestment(asset.id);
      toast.success('Asset deleted');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast.error('Failed to delete asset');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-semibold mb-2">Asset not found</h2>
        <p className="text-muted-foreground mb-4">The asset you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  const Icon = categoryIcons[asset.category] || TrendingUp;
  const colorClass = categoryColors[asset.category] || 'bg-gray-500';
  
  const totalValue = asset.quantity * asset.currentPrice;
  const totalCost = asset.quantity * asset.purchasePrice;
  const totalGain = totalValue - totalCost;
  const gainPercentage = ((totalGain / totalCost) * 100);
  const isPositive = totalGain >= 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className={`${colorClass} px-4 py-4 pt-14`}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleRefreshPrice}
              disabled={refreshing}
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {asset.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <p className="text-white/80 capitalize">{asset.category.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <main className="px-4 py-6 space-y-6">
        {/* Value Card */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-3xl font-bold">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center gap-2 mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-medium">
              {isPositive ? '+' : ''}{gainPercentage.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">
              ({isPositive ? '+' : ''}${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Quantity</span>
              </div>
              <span className="font-medium">{asset.quantity.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Purchase Price</span>
              </div>
              <span className="font-medium">${asset.purchasePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Current Price</span>
              </div>
              <div className="text-right">
                <span className="font-medium">${asset.currentPrice.toLocaleString()}</span>
                {refreshing && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}
              </div>
            </div>
            {asset.platform && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Platform / Symbol</span>
                </div>
                <span className="font-medium">{asset.platform}</span>
              </div>
            )}
            {asset.interestRate && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Interest Rate</span>
                </div>
                <span className="font-medium">{asset.interestRate}%</span>
              </div>
            )}
            {asset.maturityDate && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Maturity Date</span>
                </div>
                <span className="font-medium">{new Date(asset.maturityDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Last Updated</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {asset.lastUpdated.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12"
            onClick={() => toast.info('Edit feature coming soon')}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            className="h-12"
            onClick={() => navigate('/alerts')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Set Alert
          </Button>
        </div>

        {/* Price Refresh */}
        <Button 
          className="w-full h-12" 
          onClick={handleRefreshPrice}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Updating Price...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Current Price
            </>
          )}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default AssetDetails;
