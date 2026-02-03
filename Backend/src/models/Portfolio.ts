import pool from '../config/database';

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export async function createPortfolio(userId: string, name: string, description?: string): Promise<Portfolio> {
  const result = await pool.query(
    `INSERT INTO portfolios (user_id, name, description) 
     VALUES ($1, $2, $3) 
     RETURNING id, user_id, name, description, created_at, updated_at`,
    [userId, name, description || null]
  );
  return result.rows[0];
}

export async function getPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
  const result = await pool.query(
    `SELECT id, user_id, name, description, created_at, updated_at 
     FROM portfolios 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getPortfolioById(portfolioId: string, userId: string): Promise<Portfolio | null> {
  const result = await pool.query(
    `SELECT id, user_id, name, description, created_at, updated_at 
     FROM portfolios 
     WHERE id = $1 AND user_id = $2`,
    [portfolioId, userId]
  );
  return result.rows[0] || null;
}

export async function updatePortfolio(portfolioId: string, userId: string, name: string, description?: string): Promise<Portfolio> {
  const result = await pool.query(
    `UPDATE portfolios 
     SET name = $1, description = $2, updated_at = NOW() 
     WHERE id = $3 AND user_id = $4 
     RETURNING id, user_id, name, description, created_at, updated_at`,
    [name, description || null, portfolioId, userId]
  );
  return result.rows[0];
}
