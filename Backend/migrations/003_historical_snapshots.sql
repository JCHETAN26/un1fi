-- Migration: 003_historical_snapshots.sql
CREATE TABLE IF NOT EXISTS historical_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- We can use a dummy UUID for now since we're in demo mode
    total_assets DECIMAL(24, 4) NOT NULL,
    total_liabilities DECIMAL(24, 4) DEFAULT 0,
    net_worth DECIMAL(24, 4) NOT NULL,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_snapshots_user_date ON historical_snapshots(user_id, snapshot_date);
