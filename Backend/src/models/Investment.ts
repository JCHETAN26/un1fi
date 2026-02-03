import pool from '../config/database';

export type AssetType = 'stock' | 'bond' | 'fund' | 'real_estate' | 'commodity' | 'crypto' | 'other';

export interface Investment {
  id: string;
  portfolio_id: string;
  asset_type: string; // broadened from AssetType enum to allow flexible types
  symbol?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: Date;
  current_price?: number;
  current_value?: number;
  notes?: string;
  maturity_date?: Date;
  expected_return?: number;
  metadata?: any;
  currency?: string;
  broker_platform?: string;
  is_liability?: boolean;
  dividend_yield?: number;
  interest_rate?: number;
  last_dividend_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export async function createInvestment(
  portfolioId: string,
  assetType: string,
  name: string,
  quantity: number,
  purchasePrice: number,
  purchaseDate: Date,
  symbol?: string,
  notes?: string,
  maturityDate?: Date,
  expectedReturn?: number,
  metadata: any = {},
  currency: string = 'USD',
  brokerPlatform?: string,
  isLiability: boolean = false,
  dividendYield?: number,
  interestRate?: number
): Promise<Investment> {
  const result = await pool.query(
    `INSERT INTO investments 
     (portfolio_id, asset_type, symbol, name, quantity, purchase_price, purchase_date, notes, maturity_date, expected_return, metadata, currency, broker_platform, is_liability, dividend_yield, interest_rate) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
     RETURNING *`,
    [
      portfolioId,
      assetType,
      symbol || null,
      name,
      quantity,
      purchasePrice,
      purchaseDate,
      notes || null,
      maturityDate || null,
      expectedReturn || null,
      JSON.stringify(metadata),
      currency,
      brokerPlatform || null,
      isLiability,
      dividendYield || null,
      interestRate || null
    ]
  );
  return result.rows[0];
}

export async function getInvestmentsByPortfolioId(portfolioId: string): Promise<Investment[]> {
  const result = await pool.query(
    `SELECT * FROM investments WHERE portfolio_id = $1 ORDER BY created_at DESC`,
    [portfolioId]
  );
  return result.rows;
}

export async function updateInvestmentPrice(investmentId: string, currentPrice: number): Promise<Investment> {
  const result = await pool.query(
    `UPDATE investments 
     SET current_price = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [currentPrice, investmentId]
  );
  return result.rows[0];
}

export async function deleteInvestment(investmentId: string, portfolioId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM investments WHERE id = $1 AND portfolio_id = $2',
    [investmentId, portfolioId]
  );
  return result.rowCount! > 0;
}
