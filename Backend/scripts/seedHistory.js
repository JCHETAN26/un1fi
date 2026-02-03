require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function seedHistory() {
    const userId = '00000000-0000-0000-0000-000000000001';

    console.log('Seeding historical data for demo user...');

    try {
        // Start with a base net worth and grow it randomly over 30 days
        let currentNetWorth = 350000;

        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const change = (Math.random() - 0.4) * 5000; // Average growth
            currentNetWorth += change;

            const totalAssets = currentNetWorth * 1.2;
            const totalLiabilities = totalAssets - currentNetWorth;

            await pool.query(`
        INSERT INTO historical_snapshots (user_id, total_assets, total_liabilities, net_worth, snapshot_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
          total_assets = EXCLUDED.total_assets,
          total_liabilities = EXCLUDED.total_liabilities,
          net_worth = EXCLUDED.net_worth
      `, [userId, totalAssets, totalLiabilities, currentNetWorth, date.toISOString().split('T')[0]]);
        }

        console.log('✓ Successfully seeded 30 days of history');
    } catch (err) {
        console.error('Error seeding history:', err);
    } finally {
        await pool.end();
    }
}

seedHistory();
