import { Wallet, PiggyBank, TrendingUp, Shield } from 'lucide-react';
import { Asset } from '@/types/portfolio';

interface Props {
  assets: Asset[];
}

export const QuickStats = ({ assets }: Props) => {
  const totalAssets = assets.length;
  const totalPlatforms = new Set(assets.map(a => a.platform).filter(Boolean)).size;
  const avgGain = assets.reduce((sum, asset) => {
    const gain = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
    return sum + gain;
  }, 0) / assets.length;
  
  const fixedIncomeValue = assets
    .filter(a => a.category === 'fixed_income' || a.category === 'cash')
    .reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);

  const stats = [
    {
      label: 'Total Assets',
      value: totalAssets.toString(),
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Platforms',
      value: totalPlatforms.toString(),
      icon: PiggyBank,
      color: 'text-chart-stocks',
      bgColor: 'bg-chart-stocks/10',
    },
    {
      label: 'Avg. Return',
      value: `${avgGain >= 0 ? '+' : ''}${avgGain.toFixed(1)}%`,
      icon: TrendingUp,
      color: avgGain >= 0 ? 'text-success' : 'text-destructive',
      bgColor: avgGain >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      label: 'Fixed Income',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(fixedIncomeValue),
      icon: Shield,
      color: 'text-chart-fixedIncome',
      bgColor: 'bg-chart-fixedIncome/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat) => (
        <div key={stat.label} className="card-stat">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
