import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { usePremium } from '@/contexts/PremiumContext';
import { investmentApi } from '@/lib/api';
import { Asset } from '@/types/portfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, ChevronRight, Crown, Lock, Loader2 } from 'lucide-react';
import { mockAssets, calculatePortfolioSummary, calculateAllocation } from '@/data/mockPortfolio';
import { Button } from '@/components/ui/button';

import { calculateRealPortfolioMetrics, getPortfolioInsights } from '@/lib/calculationUtils';
import { calculateXIRR, getAssetCashFlows } from '@/lib/xirr';
import { BenchmarkComparisonChart } from '@/components/BenchmarkComparisonChart';

const Analytics = () => {
  const navigate = useNavigate();
  const { isPremium, isLoading: isPremiumLoading } = usePremium();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await investmentApi.getAssets();
      const transformedAssets: Asset[] = data.map((item: any) => ({
        id: item.id || item._id || `${Date.now()}_${Math.random()}`,
        name: item.name,
        category: item.category || item.assetType,
        quantity: parseFloat(item.quantity) || 1,
        purchasePrice: parseFloat(item.purchasePrice) || 0,
        currentPrice: parseFloat(item.currentPrice) || parseFloat(item.purchasePrice) || 0,
        currency: item.currency || 'USD',
        platform: item.platform || item.symbol || '',
        lastUpdated: new Date(item.updated_at || item.updatedAt || item.purchase_date || item.purchaseDate || Date.now()),
        isLiability: item.is_liability || item.isLiability || item.category === 'liabilities',
        purchaseDate: item.purchase_date || item.purchaseDate || item.created_at || item.createdAt || new Date().toISOString(),
        dividendYield: parseFloat(item.dividend_yield || item.dividendYield) || 0,
        interestRate: parseFloat(item.interest_rate || item.interestRate) || 0,
      }));
      setAssets(transformedAssets.length > 0 ? transformedAssets : mockAssets);
    } catch (error) {
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  const metrics = calculateRealPortfolioMetrics(assets);
  const recommendations = getPortfolioInsights(assets, metrics);
  const cashflows = getAssetCashFlows(assets);
  const xirr = calculateXIRR(cashflows);

  const allocation = Object.entries(metrics.allocationByType).map(([category, value]) => ({
    category,
    value,
    percentage: metrics.totalValue > 0 ? (value / metrics.totalValue) * 100 : 0,
  }));

  const COLORS: Record<string, string> = {
    stocks: '#3b82f6',
    gold: '#eab308',
    silver: '#9ca3af',
    real_estate: '#8b5cf6',
    fixed_income: '#10b981',
    crypto: '#f97316',
    cash: '#6b7280',
    liabilities: '#ef4444',
  };

  // Mock performance data (Historical snapshots coming next)
  const monthlyPerformance = [
    { month: 'Aug', value: 2.3 },
    { month: 'Sep', value: -1.2 },
    { month: 'Oct', value: 3.8 },
    { month: 'Nov', value: 1.5 },
    { month: 'Dec', value: 4.2 },
    { month: 'Jan', value: 1.8 },
  ];

  // Risk metrics
  const riskMetrics = {
    diversificationScore: metrics.diversificationScore,
    volatility: 14.2, // To be calculated
    sharpeRatio: 1.24, // To be calculated
    beta: 0.85, // To be calculated
    maxDrawdown: -8.3, // To be calculated
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        {/* Portfolio Performance Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold opacity-90">Portfolio Analytics</h2>
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
              Premium
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-70">Total Returns</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalGain)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">{metrics.totalGainPercentage > 0 ? '+' : ''}{metrics.totalGainPercentage.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm opacity-70">XIRR (Annualized)</p>
              <p className="text-2xl font-bold">{xirr.toFixed(2)}%</p>
              <p className="text-sm opacity-70">Time-weighted return</p>
            </div>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-4">Monthly Performance</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformance}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Return']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Passive Income Card */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Passive Income</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Annual Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalPassiveIncome)}</p>
              <p className="text-xs text-green-700/70 mt-1">Est. Yearly Cashflow</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Avg. Yield</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.averageYield.toFixed(2)}%</p>
              <p className="text-xs text-blue-700/70 mt-1">Portfolio Weight</p>
            </div>
          </div>
        </div>

        {/* Diversification Score */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Diversification Score</h3>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${riskMetrics.diversificationScore * 2.51} 251`}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{riskMetrics.diversificationScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Your portfolio is <span className="text-primary font-medium">well diversified</span> across multiple asset classes.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>View breakdown</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation Breakdown */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-4">Asset Allocation</h3>
          <div className="flex gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#6b7280'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {allocation.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[item.category] }}
                    />
                    <span className="text-sm capitalize">{item.category.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <BenchmarkComparisonChart />

        {/* Risk Metrics */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Risk Metrics</h3>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
              <p className="text-xl font-bold text-primary">{riskMetrics.sharpeRatio}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Volatility</p>
              <p className="text-xl font-bold">{riskMetrics.volatility}%</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Beta</p>
              <p className="text-xl font-bold">{riskMetrics.beta}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Max Drawdown</p>
              <p className="text-xl font-bold text-destructive">{riskMetrics.maxDrawdown}%</p>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">💡 Insights & Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-start gap-3 ${rec.type === 'warning' ? 'bg-amber-500/10' :
                  rec.type === 'success' ? 'bg-green-500/10' :
                    'bg-blue-500/10'
                  }`}
              >
                {rec.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                ) : rec.type === 'success' ? (
                  <TrendingUp className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Upsell Banner (for non-premium users) */}
        {
          !isPremium && (
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-5 border border-amber-500/30 text-center">
              <Crown className="h-10 w-10 mx-auto mb-3 text-amber-500" />
              <h3 className="font-bold text-lg mb-2">Unlock Full Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized recommendations, rebalancing alerts, and advanced risk analysis with Premium.
              </p>
              <Button
                onClick={() => navigate('/premium')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          )
        }
      </main >

      <BottomNav />
    </div >
  );
};

export default Analytics;
