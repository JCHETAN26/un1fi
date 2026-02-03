export type AssetCategory =
  | 'stocks'
  | 'gold'
  | 'silver'
  | 'crypto'
  | 'real_estate'
  | 'fixed_income'
  | 'cash'
  | 'liabilities';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  platform?: string;
  maturityDate?: string; // For fixed income
  interestRate?: number; // For fixed income/cash/liabilities
  dividendYield?: number; // For stocks (annual percentage)
  isLiability?: boolean;
  metadata?: any;
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: number;
  totalAssets: number;
  totalLiabilities: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;
}

export interface AllocationData {
  category: AssetCategory;
  value: number;
  percentage: number;
  color: string;
}

export const categoryLabels: Record<AssetCategory, string> = {
  stocks: 'Stocks',
  gold: 'Gold',
  silver: 'Silver',
  crypto: 'Crypto',
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
  cash: 'Cash',
  liabilities: 'Liabilities',
};

export const categoryColors: Record<AssetCategory, string> = {
  stocks: 'hsl(var(--chart-stocks))',
  gold: 'hsl(var(--chart-gold))',
  silver: 'hsl(var(--chart-cash))',
  crypto: 'hsl(var(--chart-crypto))',
  real_estate: 'hsl(var(--chart-real-estate))',
  fixed_income: 'hsl(var(--chart-fixed-income))',
  cash: 'hsl(var(--chart-cash))',
  liabilities: 'hsl(0, 100%, 50%)', // Red for liabilities
};
