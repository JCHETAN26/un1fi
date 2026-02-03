import { Asset } from '@/types/portfolio';

export interface PortfolioMetrics {
    totalValue: number;
    totalInvested: number;
    totalGain: number;
    totalGainPercentage: number;
    diversificationScore: number;
    allocationByType: Record<string, number>;
    liabilities: number;
    netWorth: number;
    totalPassiveIncome: number;
    averageYield: number;
}

/**
 * Calculates a diversification score from 0-100
 * Based on the Herfindahl-Hirschman Index (HHI)
 */
export const calculateDiversificationScore = (assets: Asset[]): number => {
    const assetsOnly = assets.filter(a => !a.isLiability && a.category !== 'liabilities');
    const totalValue = assetsOnly.reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);

    if (totalValue === 0) return 0;

    const categoryTotals: Record<string, number> = {};
    assetsOnly.forEach(asset => {
        const value = asset.currentPrice * asset.quantity;
        categoryTotals[asset.category] = (categoryTotals[asset.category] || 0) + value;
    });

    let hhi = 0;
    Object.values(categoryTotals).forEach(value => {
        const percentage = (value / totalValue) * 100;
        hhi += percentage * percentage;
    });

    // HHI ranges from 0-10000. Normalize to 0-100
    // Higher Score = Better Diversification
    return Math.round(100 - (hhi / 100));
};

export const getPortfolioInsights = (assets: Asset[], metrics: PortfolioMetrics) => {
    const insights: Array<{ type: 'success' | 'warning' | 'info'; text: string }> = [];

    const score = calculateDiversificationScore(assets);

    if (score > 70) {
        insights.push({ type: 'success', text: 'Excellent diversification! Your risk is well-spread across asset classes.' });
    } else if (score > 40) {
        insights.push({ type: 'info', text: 'Fair diversification. Consider adding non-correlated assets like Gold or Bonds.' });
    } else {
        insights.push({ type: 'warning', text: 'Highly concentrated portfolio. You are vulnerable to sector-specific downturns.' });
    }

    const cryptoRatio = (metrics.allocationByType['crypto'] || 0) / metrics.totalValue;
    if (cryptoRatio > 0.2) {
        insights.push({ type: 'warning', text: 'High Crypto exposure (>' + Math.round(cryptoRatio * 100) + '%). Ensure you can handle this level of volatility.' });
    }

    const liabilityRatio = metrics.liabilities / (metrics.totalValue + metrics.liabilities);
    if (liabilityRatio > 0.5) {
        insights.push({ type: 'warning', text: 'Debt-to-Asset ratio is high (' + Math.round(liabilityRatio * 100) + '%). Focus on reducing high-interest liabilities.' });
    }

    if (!metrics.allocationByType['gold'] && !metrics.allocationByType['silver']) {
        insights.push({ type: 'info', text: 'No Precious Metals found. Adding 5-10% Gold can hedge against inflation.' });
    }

    return insights;
};

export const calculateRealPortfolioMetrics = (assets: Asset[]): PortfolioMetrics => {
    const totalAssets = assets
        .filter(a => !a.isLiability && a.category !== 'liabilities')
        .reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);

    const liabilities = assets
        .filter(a => a.isLiability || a.category === 'liabilities')
        .reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);

    const netWorth = totalAssets - liabilities;

    const totalInvested = assets.reduce((sum, a) => {
        const cost = a.purchasePrice * a.quantity;
        return a.isLiability || a.category === 'liabilities' ? sum - cost : sum + cost;
    }, 0);

    const totalGain = netWorth - totalInvested;
    const totalGainPercentage = totalInvested !== 0 ? (totalGain / Math.abs(totalInvested)) * 100 : 0;

    // Passive Income Calculation
    let totalPassiveIncome = 0;
    assets.forEach(asset => {
        const assetValue = asset.currentPrice * asset.quantity;
        if (asset.category === 'fixed_income' || asset.category === 'cash') {
            totalPassiveIncome += (assetValue * (asset.interestRate || 0)) / 100;
        } else if (asset.category === 'stocks') {
            totalPassiveIncome += (assetValue * (asset.dividendYield || 0)) / 100;
        }
    });

    const averageYield = totalAssets > 0 ? (totalPassiveIncome / totalAssets) * 100 : 0;

    const allocationByType: Record<string, number> = {};
    assets.filter(a => !a.isLiability && a.category !== 'liabilities').forEach(asset => {
        const value = asset.currentPrice * asset.quantity;
        allocationByType[asset.category] = (allocationByType[asset.category] || 0) + value;
    });

    return {
        totalValue: totalAssets,
        totalInvested,
        totalGain,
        totalGainPercentage,
        diversificationScore: calculateDiversificationScore(assets),
        allocationByType,
        liabilities,
        netWorth,
        totalPassiveIncome,
        averageYield
    };
};
