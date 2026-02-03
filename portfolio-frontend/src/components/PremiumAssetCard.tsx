import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Asset, categoryLabels } from '@/types/portfolio';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  asset: Asset;
}

const categoryIcons: Record<string, string> = {
  stocks: '📈',
  gold: '🥇',
  silver: '🥈',
  real_estate: '🏠',
  fixed_income: '🏦',
  crypto: '₿',
  cash: '💵',
};

const categoryColors: Record<string, { bg: string; text: string; accent: string }> = {
  stocks: { bg: 'bg-blue-500/10', text: 'text-blue-600', accent: '#3b82f6' },
  gold: { bg: 'bg-amber-500/10', text: 'text-amber-600', accent: '#f59e0b' },
  silver: { bg: 'bg-slate-400/10', text: 'text-slate-500', accent: '#64748b' },
  real_estate: { bg: 'bg-purple-500/10', text: 'text-purple-600', accent: '#9333ea' },
  fixed_income: { bg: 'bg-teal-500/10', text: 'text-teal-600', accent: '#14b8a6' },
  crypto: { bg: 'bg-orange-500/10', text: 'text-orange-600', accent: '#f97316' },
  cash: { bg: 'bg-gray-500/10', text: 'text-gray-600', accent: '#6b7280' },
};

// Generate mini sparkline data
const generateSparklineData = (currentPrice: number, isPositive: boolean) => {
  const data = [];
  let value = currentPrice * (isPositive ? 0.95 : 1.05);
  
  for (let i = 0; i < 20; i++) {
    const change = (Math.random() - 0.5) * currentPrice * 0.02;
    const trend = isPositive 
      ? (currentPrice - value) / 20 
      : -(value - currentPrice) / 20;
    value = value + change + trend;
    data.push({ value });
  }
  
  // Ensure last point is current price
  data[data.length - 1] = { value: currentPrice };
  
  return data;
};

export const PremiumAssetCard = ({ asset }: Props) => {
  const navigate = useNavigate();
  const totalValue = asset.currentPrice * asset.quantity;
  const totalCost = asset.purchasePrice * asset.quantity;
  const gain = totalValue - totalCost;
  const gainPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  const isPositive = gain >= 0;
  
  const colors = categoryColors[asset.category] || categoryColors.cash;
  const sparklineData = generateSparklineData(asset.currentPrice, isPositive);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
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
      className="w-full group"
    >
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm 
                      hover:shadow-md hover:border-primary/20 
                      active:scale-[0.98] transition-all duration-200">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl`}>
            {categoryIcons[asset.category] || '💰'}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{asset.name}</h3>
              {asset.quantity > 1 && (
                <span className="text-xs text-muted-foreground">
                  ×{asset.quantity.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium ${colors.text}`}>
                {categoryLabels[asset.category]}
              </span>
              {asset.platform && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{asset.platform}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Value */}
          <div className="text-right min-w-[80px]">
            <p className="font-bold text-base">{formatCurrency(totalValue)}</p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{gainPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  );
};
