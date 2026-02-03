import { TrendingUp, TrendingDown, Calendar, Percent } from 'lucide-react';
import { Asset, categoryLabels } from '@/types/portfolio';
import { Badge } from '@/components/ui/badge';

interface Props {
  asset: Asset;
}

const categoryBadgeColors: Record<string, string> = {
  stocks: 'bg-chart-stocks/10 text-chart-stocks border-chart-stocks/20',
  gold: 'bg-accent/20 text-accent-foreground border-accent/30',
  silver: 'bg-chart-cash/20 text-muted-foreground border-chart-cash/30',
  crypto: 'bg-chart-crypto/10 text-chart-crypto border-chart-crypto/20',
  real_estate: 'bg-chart-realEstate/10 text-chart-realEstate border-chart-realEstate/20',
  fixed_income: 'bg-chart-fixedIncome/10 text-chart-fixedIncome border-chart-fixedIncome/20',
  cash: 'bg-muted text-muted-foreground border-border',
};

export const AssetCard = ({ asset }: Props) => {
  const totalValue = asset.currentPrice * asset.quantity;
  const totalCost = asset.purchasePrice * asset.quantity;
  const gain = totalValue - totalCost;
  const gainPercentage = ((totalValue - totalCost) / totalCost) * 100;
  const isPositive = gain >= 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: asset.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: asset.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="card-elevated p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{asset.name}</h4>
          {asset.platform && (
            <p className="text-xs text-muted-foreground mt-0.5">{asset.platform}</p>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={`badge-category ${categoryBadgeColors[asset.category]} border`}
        >
          {categoryLabels[asset.category]}
        </Badge>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{formatCurrency(gain)} ({gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="text-right text-sm text-muted-foreground">
          {asset.quantity !== 1 && (
            <p>{asset.quantity} units</p>
          )}
          {asset.maturityDate && (
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(asset.maturityDate)}</span>
            </div>
          )}
          {asset.interestRate && (
            <div className="flex items-center gap-1 justify-end text-success">
              <Percent className="h-3 w-3" />
              <span>{asset.interestRate}% APY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
