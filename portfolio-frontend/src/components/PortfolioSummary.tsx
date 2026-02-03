import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';

interface Props {
  summary: PortfolioSummaryType;
}

export const PortfolioSummary = ({ summary }: Props) => {
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
    <div className="animate-fade-in">
      <div className="mb-2">
        <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-1">
          {formatCurrency(summary.totalValue)}
        </h1>
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={isPositive ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {formatCurrency(Math.abs(summary.totalGain))} ({formatPercentage(summary.totalGainPercentage)})
          </span>
          <span className="text-muted-foreground text-sm">all time</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={isDailyPositive ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {isDailyPositive ? '+' : ''}{formatCurrency(summary.dailyChange)} ({formatPercentage(summary.dailyChangePercentage)})
          </span>
          <span className="text-muted-foreground text-sm">today</span>
        </div>
      </div>
    </div>
  );
};
