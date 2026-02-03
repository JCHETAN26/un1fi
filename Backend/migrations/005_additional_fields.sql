-- Migration: 005_additional_fields.sql
ALTER TABLE investments ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(10, 4);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS purchase_date DATE DEFAULT CURRENT_DATE;
-- Note: purchase_date might already exist, but we ensure it has a default
