import { Wallet, Building2, TrendingUp, Landmark } from 'lucide-react';
import { Asset } from '@/types/portfolio';

interface Props {
  assets: Asset[];
}

export const MobileQuickStats = ({ assets }: Props) => {
  const totalAssets = assets.length;
  const totalPlatforms = new Set(assets.map(a => a.platform)).size;
  const avgGain = assets.reduce((sum, a) => sum + ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100, 0) / assets.length;
  const fixedIncomeValue = assets
    .filter(a => a.category === 'fixed_income')
    .reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);

  const stats = [
    { 
      label: 'Assets', 
      value: totalAssets.toString(),
      icon: Wallet,
    },
    { 
      label: 'Platforms', 
      value: totalPlatforms.toString(),
      icon: Building2,
    },
    { 
      label: 'Avg Return', 
      value: `${avgGain >= 0 ? '+' : ''}${avgGain.toFixed(1)}%`,
      icon: TrendingUp,
    },
    { 
      label: 'Fixed', 
      value: `$${(fixedIncomeValue / 1000).toFixed(0)}k`,
      icon: Landmark,
    },
  ];

  return (
    <div className="px-4 animate-slide-up">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="bg-card rounded-xl p-3 border border-border text-center"
            >
              <Icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-lg font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
