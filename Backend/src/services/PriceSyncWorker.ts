import pool from '../config/database';
import priceService from './PriceService';

// Mock dividend yields for popular stocks (Annual Yield %)
const COMMON_DIVIDENDS: Record<string, number> = {
    'AAPL': 0.45,
    'MSFT': 0.70,
    'KO': 3.10,
    'O': 5.50,
    'SCHD': 3.40,
    'VOO': 1.30,
    'IBM': 3.80,
    'PEP': 2.90,
    'VTI': 1.40,
    'JNJ': 3.00,
};

class PriceSyncWorker {
    private isRunning: boolean = false;
    private interval: NodeJS.Timeout | null = null;

    async start(intervalMs: number = 30 * 60 * 1000) { // Default 30 mins
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('✓ Price sync worker started');

        // Initial run
        await this.syncAllPrices();

        this.interval = setInterval(() => {
            this.syncAllPrices();
        }, intervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log('✗ Price sync worker stopped');
    }

    private async syncAllPrices() {
        console.log(`[${new Date().toISOString()}] Starting global price sync...`);

        try {
            // 1. Get all unique active symbols and their types
            const { rows: assets } = await pool.query(
                `SELECT DISTINCT asset_type, symbol 
         FROM investments 
         WHERE symbol IS NOT NULL 
         AND asset_type IN ('stock', 'stocks', 'crypto', 'gold', 'silver', 'commodity')`
            );

            console.log(`Syncing prices for ${assets.length} unique assets...`);

            for (const asset of assets) {
                try {
                    const priceData = await priceService.getPrice(asset.asset_type, asset.symbol);

                    if (priceData) {
                        // 2. Update all investments matching this symbol/type
                        const divYield = COMMON_DIVIDENDS[asset.symbol?.toUpperCase()] || null;

                        await pool.query(
                            `UPDATE investments 
               SET current_price = $1, 
                   dividend_yield = COALESCE(dividend_yield, $4),
                   updated_at = NOW() 
               WHERE asset_type = $2 AND symbol = $3`,
                            [priceData.price, asset.asset_type, asset.symbol, divYield]
                        );
                        console.log(`✓ Updated ${asset.symbol} to $${priceData.price}${divYield ? ` (Div: ${divYield}%)` : ''}`);
                    }
                } catch (err) {
                    console.error(`Error syncing ${asset.symbol}:`, err);
                }
            }

            console.log(`[${new Date().toISOString()}] Price sync completed.`);

            // 3. Take historical snapshots
            await this.takeSnapshots();
        } catch (error) {
            console.error('Fatal error in price sync worker:', error);
        }
    }

    private async takeSnapshots() {
        console.log('Taking historical snapshots...');
        try {
            // Get net worth for all users who have investments
            const { rows: summaries } = await pool.query(`
                SELECT 
                    user_id,
                    SUM(CASE WHEN is_liability = false THEN quantity * COALESCE(current_price, purchase_price) ELSE 0 END) as total_assets,
                    SUM(CASE WHEN is_liability = true THEN quantity * COALESCE(current_price, purchase_price) ELSE 0 END) as total_liabilities
                FROM investments
                GROUP BY user_id
            `);

            for (const summary of summaries) {
                const totalAssets = parseFloat(summary.total_assets) || 0;
                const totalLiabilities = parseFloat(summary.total_liabilities) || 0;
                const netWorth = totalAssets - totalLiabilities;

                await pool.query(`
                    INSERT INTO historical_snapshots (user_id, total_assets, total_liabilities, net_worth, snapshot_date)
                    VALUES ($1, $2, $3, $4, CURRENT_DATE)
                    ON CONFLICT (user_id, snapshot_date) 
                    DO UPDATE SET 
                        total_assets = EXCLUDED.total_assets,
                        total_liabilities = EXCLUDED.total_liabilities,
                        net_worth = EXCLUDED.net_worth,
                        created_at = NOW()
                `, [summary.user_id, totalAssets, totalLiabilities, netWorth]);

                console.log(`✓ Snapshot saved for user ${summary.user_id}: $${netWorth}`);
            }
        } catch (err) {
            console.error('Error taking snapshots:', err);
        }
    }
}

export default new PriceSyncWorker();
