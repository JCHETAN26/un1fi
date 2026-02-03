const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigrations() {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log(`Found ${files.length} migrations...`);

    for (const file of files) {
        if (file.endsWith('.sql')) {
            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            try {
                await pool.query(sql);
                console.log(`✓ Migration ${file} completed successfully`);
            } catch (err) {
                console.error(`✗ Migration ${file} failed:`, err.message);
                // Continue to next migration if it's already applied (e.g. table already exists)
            }
        }
    }

    await pool.end();
}

runMigrations();
