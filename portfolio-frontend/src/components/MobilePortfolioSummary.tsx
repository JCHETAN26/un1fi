import { TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';

interface Props {
  summary: PortfolioSummaryType;
}

export const MobilePortfolioSummary = ({ summary }: Props) => {
  const isPositive = summary.totalGain >= 0;
  const isDailyPositive = summary.dailyChange >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="px-4 py-6 animate-fade-in">
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground shadow-lg">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm opacity-80">Net Worth</p>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          {formatCurrency(summary.totalValue)}
        </h2>

        <div className="flex gap-4 mt-3 mb-1 text-xs opacity-90">
          <div>
            <span className="opacity-70">Assets:</span> {formatCurrency(summary.totalAssets)}
          </div>
          <div>
            <span className="opacity-70">Liabilities:</span> {formatCurrency(summary.totalLiabilities)}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {formatPercentage(summary.totalGainPercentage)} total
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${isDailyPositive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
              }`}>
              {isDailyPositive ? '+' : ''}{formatCurrency(summary.dailyChange)} today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
