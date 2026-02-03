import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Asset, categoryLabels } from '@/types/portfolio';

interface Props {
  asset: Asset;
}

const categoryColors: Record<string, string> = {
  stocks: 'bg-blue-500/10 text-blue-600',
  gold: 'bg-amber-500/10 text-amber-600',
  silver: 'bg-slate-400/10 text-slate-500',
  real_estate: 'bg-purple-500/10 text-purple-600',
  fixed_income: 'bg-teal-500/10 text-teal-600',
  crypto: 'bg-orange-500/10 text-orange-600',
  cash: 'bg-gray-500/10 text-gray-600',
  liabilities: 'bg-red-500/10 text-red-600',
};

export const MobileAssetCard = ({ asset }: Props) => {
  const navigate = useNavigate();
  const totalValue = asset.currentPrice * asset.quantity;
  const totalCost = asset.purchasePrice * asset.quantity;
  const gain = totalValue - totalCost;
  const gainPercentage = ((totalValue - totalCost) / totalCost) * 100;
  const isPositive = gain >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: asset.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleClick = () => {
    navigate(`/asset/${asset.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-card rounded-xl p-4 border border-border active:bg-secondary/50 transition-colors touch-target text-left"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{asset.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[asset.category]}`}>
              {categoryLabels[asset.category]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{asset.platform}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(totalValue)}</p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{gainPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
};
