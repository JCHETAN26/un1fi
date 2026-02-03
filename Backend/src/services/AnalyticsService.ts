import pool from '../config/database';

export interface PortfolioAnalytics {
  totalValue: number;
  totalInvested: number;
  gainLoss: number;
  gainLossPercent: number;
  allocationByType: Record<string, { value: number; percent: number }>;
  diversificationScore: number;
  riskAssessment?: {
    portfolioVolatility: number;
    sharpeRatio: number;
    recommendations: string[];
  };
}

class AnalyticsService {
  async calculatePortfolioMetrics(portfolioId: string): Promise<PortfolioAnalytics> {
    const result = await pool.query(
      `SELECT 
        asset_type,
        quantity,
        purchase_price,
        COALESCE(current_price, purchase_price) as current_price
       FROM investments 
       WHERE portfolio_id = $1`,
      [portfolioId]
    );

    const investments = result.rows;

    let totalInvested = 0;
    let totalValue = 0;
    const allocationByType: Record<string, { quantity: number; value: number }> = {};

    investments.forEach((inv: any) => {
      const investedAmount = inv.quantity * inv.purchase_price;
      const currentValue = inv.quantity * inv.current_price;

      totalInvested += investedAmount;
      totalValue += currentValue;

      if (!allocationByType[inv.asset_type]) {
        allocationByType[inv.asset_type] = { quantity: 0, value: 0 };
      }
      allocationByType[inv.asset_type].quantity += inv.quantity;
      allocationByType[inv.asset_type].value += currentValue;
    });

    const gainLoss = totalValue - totalInvested;
    const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

    // Calculate diversification score (Herfindahl-Hirschman Index)
    const diversificationScore = this.calculateDiversificationScore(allocationByType, totalValue);

    // Convert allocation to percentages
    const allocationWithPercent: Record<string, { value: number; percent: number }> = {};
    Object.entries(allocationByType).forEach(([type, data]) => {
      allocationWithPercent[type] = {
        value: data.value,
        percent: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      };
    });

    return {
      totalValue,
      totalInvested,
      gainLoss,
      gainLossPercent,
      allocationByType: allocationWithPercent,
      diversificationScore,
    };
  }

  private calculateDiversificationScore(
    allocationByType: Record<string, { quantity: number; value: number }>,
    totalValue: number
  ): number {
    // HHI = sum of (allocation%)^2
    // Score ranges from 0 (perfect diversification) to 10000 (no diversification)
    let hhi = 0;
    Object.values(allocationByType).forEach((data) => {
      const percentage = (data.value / totalValue) * 100;
      hhi += percentage * percentage;
    });
    // Convert to 0-100 scale where higher is better
    return 100 - Math.min(hhi / 100, 100);
  }

  async generatePremiumAnalysis(portfolioId: string): Promise<PortfolioAnalytics> {
    const metrics = await this.calculatePortfolioMetrics(portfolioId);

    // Premium features: detailed risk assessment
    metrics.riskAssessment = {
      portfolioVolatility: 15.5, // Would be calculated from historical data
      sharpeRatio: 1.2, // Would be calculated from returns and risk-free rate
      recommendations: this.generateRecommendations(metrics),
    };

    return metrics;
  }

  private generateRecommendations(metrics: PortfolioAnalytics): string[] {
    const recommendations: string[] = [];

    const allocation = metrics.allocationByType;
    const stocks = allocation['stock']?.percent || 0;
    const bonds = allocation['bond']?.percent || 0;
    const realEstate = allocation['real_estate']?.percent || 0;

    if (stocks > 70) {
      recommendations.push('Your portfolio is heavily weighted toward stocks. Consider increasing bond allocation for stability.');
    }
    if (bonds === 0 && stocks > 0) {
      recommendations.push('No fixed income in your portfolio. Consider adding bonds for downside protection.');
    }
    if (realEstate === 0) {
      recommendations.push('Real estate can provide diversification and inflation protection. Consider allocating 10-20%.');
    }
    if (metrics.diversificationScore < 30) {
      recommendations.push('Low diversification detected. Spread investments across more asset types and sectors.');
    }

    return recommendations;
  }
}

export default new AnalyticsService();
