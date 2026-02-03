/**
 * XIRR Calculation using Newton-Raphson method
 * Required for intelligent performance tracking
 */

interface CashFlow {
    amount: number;
    date: Date;
}

export const calculateXIRR = (cashflows: CashFlow[]): number => {
    if (cashflows.length < 2) return 0;

    // Initial guess: 10%
    let rate = 0.1;
    const maxIterations = 100;
    const precision = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
        let f = 0;
        let df = 0;

        for (const cf of cashflows) {
            const years = (cf.date.getTime() - cashflows[0].date.getTime()) / (365 * 24 * 60 * 60 * 1000);
            f += cf.amount / Math.pow(1 + rate, years);
            df -= (years * cf.amount) / Math.pow(1 + rate, years + 1);
        }

        const newRate = rate - f / df;
        if (Math.abs(newRate - rate) < precision) {
            return newRate * 100; // Return as percentage
        }
        rate = newRate;
    }

    return rate * 100;
};

/**
 * Generates cashflows from asset list for XIRR calculation
 */
export const getAssetCashFlows = (assets: any[]) => {
    const cashflows: CashFlow[] = [];
    let totalCurrentValue = 0;

    assets.forEach(asset => {
        // Initial investment (negative cashflow)
        cashflows.push({
            amount: -(asset.purchasePrice * asset.quantity),
            date: new Date(asset.purchaseDate || asset.createdAt || Date.now())
        });
        totalCurrentValue += asset.currentPrice * asset.quantity;
    });

    // Current value (positive cashflow today)
    cashflows.push({
        amount: totalCurrentValue,
        date: new Date()
    });

    // Sort by date
    return cashflows.sort((a, b) => a.date.getTime() - b.date.getTime());
};
