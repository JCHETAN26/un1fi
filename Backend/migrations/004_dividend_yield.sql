-- Migration: 004_dividend_yield.sql
ALTER TABLE investments ADD COLUMN IF NOT EXISTS dividend_yield DECIMAL(10, 4);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS last_dividend_date DATE;
