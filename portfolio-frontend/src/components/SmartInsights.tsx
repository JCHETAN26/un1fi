import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '@/types/portfolio';
import { 
  Lightbulb, TrendingUp, TrendingDown, AlertTriangle, 
  ArrowRight, PiggyBank, Target, Shield, Coins, Calendar,
  CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  type: 'warning' | 'suggestion' | 'success' | 'info';
  priority: number;
  title: string;
  description: string;
  action?: { label: string; path: string };
  icon: React.ElementType;
}

interface SmartInsightsProps {
  assets: Asset[];
  className?: string;
}

export const SmartInsights = ({ assets, className = '' }: SmartInsightsProps) => {
  const navigate = useNavigate();

  const insights = useMemo(() => {
    const allInsights: Insight[] = [];
    
    if (assets.length === 0) return allInsights;

    const totalValue = assets.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);
    
    // Calculate allocations
    const allocations: Record<string, number> = {};
    assets.forEach(asset => {
      const value = asset.currentPrice * asset.quantity;
      allocations[asset.category] = (allocations[asset.category] || 0) + value;
    });
    
    const allocationPercentages: Record<string, number> = {};
    Object.entries(allocations).forEach(([category, value]) => {
      allocationPercentages[category] = (value / totalValue) * 100;
    });

    // 1. High cash allocation warning
    if (allocationPercentages.cash && allocationPercentages.cash > 30) {
      allInsights.push({
        id: 'high-cash',
        type: 'suggestion',
        priority: 1,
        title: `${Math.round(allocationPercentages.cash)}% in cash is high`,
        description: 'Consider moving some to higher-yield investments. Your cash may be losing value to inflation.',
        action: { label: 'Explore options', path: '/analytics' },
        icon: PiggyBank,
      });
    }

    // 2. Gold/Silver over-allocation
    const preciousMetals = (allocationPercentages.gold || 0) + (allocationPercentages.silver || 0);
    if (preciousMetals > 25) {
      allInsights.push({
        id: 'high-metals',
        type: 'warning',
        priority: 2,
        title: `Precious metals at ${Math.round(preciousMetals)}%`,
        description: 'Most advisors recommend 5-15% in gold/silver. Is this intentional?',
        icon: Coins,
      });
    }

    // 3. Low diversification
    const categoryCount = Object.keys(allocations).length;
    if (categoryCount < 3 && assets.length > 2) {
      allInsights.push({
        id: 'low-diversification',
        type: 'warning',
        priority: 1,
        title: 'Portfolio needs diversification',
        description: `You only have ${categoryCount} asset type${categoryCount > 1 ? 's' : ''}. Consider spreading across more categories.`,
        action: { label: 'Add assets', path: '/add-asset' },
        icon: Shield,
      });
    }

    // 4. Maturing investments
    const maturingSoon = assets.filter(a => {
      if (!a.maturityDate) return false;
      const daysUntil = (new Date(a.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    });
    
    if (maturingSoon.length > 0) {
      const totalMaturing = maturingSoon.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);
      allInsights.push({
        id: 'maturing-soon',
        type: 'info',
        priority: 0,
        title: `${maturingSoon.length} investment${maturingSoon.length > 1 ? 's' : ''} maturing soon`,
        description: `$${totalMaturing.toLocaleString()} will be available within 30 days. Plan your reinvestment.`,
        action: { label: 'View calendar', path: '/calendar' },
        icon: Calendar,
      });
    }

    // 5. Good diversification praise
    if (categoryCount >= 4 && assets.length >= 5) {
      allInsights.push({
        id: 'good-diversification',
        type: 'success',
        priority: 10,
        title: 'Well diversified portfolio!',
        description: `You're spread across ${categoryCount} asset classes. Keep it up!`,
        icon: CheckCircle2,
      });
    }

    // 6. Single stock concentration
    const stockAssets = assets.filter(a => a.category === 'stocks');
    if (stockAssets.length > 0) {
      const stockTotal = stockAssets.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);
      stockAssets.forEach(stock => {
        const stockValue = stock.currentPrice * stock.quantity;
        const stockPercent = (stockValue / totalValue) * 100;
        if (stockPercent > 20) {
          allInsights.push({
            id: `concentrated-${stock.id}`,
            type: 'warning',
            priority: 2,
            title: `${stock.name} is ${Math.round(stockPercent)}% of portfolio`,
            description: 'High concentration in a single stock increases risk. Consider rebalancing.',
            action: { label: 'View asset', path: `/asset/${stock.id}` },
            icon: AlertTriangle,
          });
        }
      });
    }

    // 7. Crypto volatility warning
    if (allocationPercentages.crypto && allocationPercentages.crypto > 15) {
      allInsights.push({
        id: 'high-crypto',
        type: 'warning',
        priority: 3,
        title: 'High crypto exposure',
        description: `${Math.round(allocationPercentages.crypto)}% in crypto is volatile. Ensure this matches your risk tolerance.`,
        icon: TrendingDown,
      });
    }

    // 8. No fixed income for stability
    if (!allocations.fixed_income && totalValue > 50000) {
      allInsights.push({
        id: 'no-fixed-income',
        type: 'suggestion',
        priority: 4,
        title: 'Consider adding fixed income',
        description: 'Bonds and deposits can provide stable returns and reduce portfolio volatility.',
        action: { label: 'Add bonds', path: '/add-asset' },
        icon: Target,
      });
    }

    // 9. Strong gains celebration
    const gainers = assets.filter(a => {
      const gain = ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100;
      return gain > 20;
    });
    
    if (gainers.length > 0) {
      const bestGainer = gainers.reduce((best, current) => {
        const currentGain = (current.currentPrice - current.purchasePrice) / current.purchasePrice;
        const bestGain = (best.currentPrice - best.purchasePrice) / best.purchasePrice;
        return currentGain > bestGain ? current : best;
      });
      const gain = ((bestGainer.currentPrice - bestGainer.purchasePrice) / bestGainer.purchasePrice) * 100;
      
      allInsights.push({
        id: 'top-performer',
        type: 'success',
        priority: 5,
        title: `${bestGainer.name} is up ${Math.round(gain)}%!`,
        description: 'Great pick! Consider taking some profits or letting it ride.',
        action: { label: 'View details', path: `/asset/${bestGainer.id}` },
        icon: TrendingUp,
      });
    }

    return allInsights.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [assets]);

  const typeStyles = {
    warning: 'bg-amber-500/10 border-amber-500/30',
    suggestion: 'bg-blue-500/10 border-blue-500/30',
    success: 'bg-green-500/10 border-green-500/30',
    info: 'bg-purple-500/10 border-purple-500/30',
  };

  const iconStyles = {
    warning: 'text-amber-500',
    suggestion: 'text-blue-500',
    success: 'text-green-500',
    info: 'text-purple-500',
  };

  if (insights.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 px-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Smart Insights</h2>
      </div>

      <div className="px-4 space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div 
              key={insight.id}
              className={`p-4 rounded-xl border ${typeStyles[insight.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${iconStyles[insight.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
                  {insight.action && (
                    <Button 
                      variant="link" 
                      className="h-auto p-0 mt-2 text-primary"
                      onClick={() => navigate(insight.action!.path)}
                    >
                      {insight.action.label}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};