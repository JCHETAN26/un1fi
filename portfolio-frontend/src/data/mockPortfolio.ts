import { Asset } from '@/types/portfolio';

export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Apple Inc.',
    category: 'stocks',
    quantity: 50,
    purchasePrice: 145.00,
    currentPrice: 178.50,
    currency: 'USD',
    platform: 'Renta 4',
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Microsoft Corp.',
    category: 'stocks',
    quantity: 30,
    purchasePrice: 280.00,
    currentPrice: 378.25,
    currency: 'USD',
    platform: 'Renta 4',
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Gold (XAU)',
    category: 'gold',
    quantity: 5,
    purchasePrice: 1850.00,
    currentPrice: 2045.30,
    currency: 'USD',
    platform: 'XTB',
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'Silver (XAG)',
    category: 'silver',
    quantity: 100,
    purchasePrice: 23.50,
    currentPrice: 24.15,
    currency: 'USD',
    platform: 'Physical',
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Bitcoin',
    category: 'crypto',
    quantity: 0.5,
    purchasePrice: 35000.00,
    currentPrice: 43250.00,
    currency: 'USD',
    platform: 'Coinbase',
    lastUpdated: new Date(),
  },
  {
    id: '6',
    name: 'Apartment Madrid',
    category: 'real_estate',
    quantity: 1,
    purchasePrice: 280000.00,
    currentPrice: 320000.00,
    currency: 'EUR',
    lastUpdated: new Date(),
  },
  {
    id: '7',
    name: 'Treasury Bond 3Y',
    category: 'fixed_income',
    quantity: 1,
    purchasePrice: 10000.00,
    currentPrice: 10450.00,
    currency: 'EUR',
    platform: 'MyInvestor',
    maturityDate: '2026-06-15',
    interestRate: 4.5,
    lastUpdated: new Date(),
  },
  {
    id: '8',
    name: 'High-Yield Savings',
    category: 'cash',
    quantity: 1,
    purchasePrice: 25000.00,
    currentPrice: 25750.00,
    currency: 'EUR',
    platform: 'Trade Republic',
    interestRate: 3.0,
    lastUpdated: new Date(),
  },
];

export const calculatePortfolioSummary = (assets: Asset[]) => {
  const totalAssets = assets
    .filter(a => !a.isLiability && a.category !== 'liabilities')
    .reduce((sum, asset) => sum + asset.currentPrice * asset.quantity, 0);

  const totalLiabilities = assets
    .filter(a => a.isLiability || a.category === 'liabilities')
    .reduce((sum, asset) => sum + asset.currentPrice * asset.quantity, 0);

  const totalValue = totalAssets - totalLiabilities; // This is Net Worth

  const totalCost = assets.reduce((sum, asset) => {
    const cost = asset.purchasePrice * asset.quantity;
    return asset.isLiability || asset.category === 'liabilities' ? sum - cost : sum + cost;
  }, 0);

  const totalGain = totalValue - totalCost;
  const totalGainPercentage = totalCost !== 0 ? (totalGain / Math.abs(totalCost)) * 100 : 0;

  // Mock daily change (simplified for now)
  const dailyChange = totalValue * 0.012;
  const dailyChangePercentage = 1.2;

  return {
    totalValue,
    totalAssets,
    totalLiabilities,
    totalGain,
    totalGainPercentage,
    dailyChange,
    dailyChangePercentage,
  };
};

export const calculateAllocation = (assets: Asset[]) => {
  const assetsOnly = assets.filter(a => !a.isLiability && a.category !== 'liabilities');
  const totalAssetsValue = assetsOnly.reduce((sum, asset) => sum + asset.currentPrice * asset.quantity, 0);

  const categoryTotals = assetsOnly.reduce((acc, asset) => {
    const value = asset.currentPrice * asset.quantity;
    acc[asset.category] = (acc[asset.category] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals).map(([category, value]) => ({
    category: category as any,
    value,
    percentage: totalAssetsValue > 0 ? (value / totalAssetsValue) * 100 : 0,
    color: '', // Will be assigned by component if needed
  }));
};
