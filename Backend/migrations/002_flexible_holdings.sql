-- Add flexible fields to investments table to support any holding
ALTER TABLE investments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE investments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE investments ADD COLUMN IF NOT EXISTS broker_platform VARCHAR(255);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS is_liability BOOLEAN DEFAULT false;

-- Add a categories table for better organization if needed, but for now we stick to asset_type
-- Ensure asset_type can hold more values than the initial ones if it was constrained
-- (The initial schema used VARCHAR(50) so it's fine)

-- Update existing column types if necessary
ALTER TABLE investments ALTER COLUMN quantity TYPE DECIMAL(24, 10);
ALTER TABLE investments ALTER COLUMN purchase_price TYPE DECIMAL(24, 4);
ALTER TABLE investments ALTER COLUMN current_price TYPE DECIMAL(24, 4);
ALTER TABLE investments ALTER COLUMN current_value TYPE DECIMAL(24, 4);
