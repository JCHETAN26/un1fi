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

async function seed() {
    const userId = '00000000-0000-0000-0000-000000000001';
    const portfolioId = '11111111-1111-1111-1111-111111111111';

    try {
        console.log('Seeding demo user...');
        await pool.query(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `, [userId, 'demo@example.com', 'hashed_password', 'Demo User']);

        console.log('Seeding demo portfolio...');
        await pool.query(`
      INSERT INTO portfolios (id, user_id, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [portfolioId, userId, 'Main Portfolio']);

        console.log('Cleaning existing investments...');
        await pool.query('DELETE FROM investments WHERE user_id = $1', [userId]);

        console.log('Seeding demo investments...');
        const investments = [
            { name: 'Apple Inc.', symbol: 'AAPL', type: 'stocks', qty: 50, price: 150, div: 0.45 },
            { name: 'Microsoft Corp.', symbol: 'MSFT', type: 'stocks', qty: 20, price: 280, div: 0.70 },
            { name: 'Bitcoin', symbol: 'bitcoin', type: 'crypto', qty: 0.5, price: 45000 },
            { name: 'Ethereum', symbol: 'ethereum', type: 'crypto', qty: 5, price: 2500 },
            { name: 'Gold Bullion', symbol: 'GOLD', type: 'gold', qty: 10, price: 1800 },
            { name: 'Cash', symbol: 'USD', type: 'cash', qty: 15000, price: 1, rate: 4.5 },
            { name: 'Savings Account', symbol: 'SAVINGS', type: 'cash', qty: 25000, price: 1, rate: 3.2 }
        ];

        for (const inv of investments) {
            await pool.query(`
        INSERT INTO investments (
          portfolio_id, user_id, name, symbol, asset_type, quantity, purchase_price, 
          current_price, dividend_yield, interest_rate, purchase_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
      `, [
                portfolioId, userId, inv.name, inv.symbol, inv.type, inv.qty, inv.price,
                inv.price, inv.div || null, inv.rate || null
            ]);
        }

        console.log('✓ Seeding complete!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
}

seed();
