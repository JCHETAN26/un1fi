import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_premium: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(email: string, passwordHash: string, name: string): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name) 
     VALUES ($1, $2, $3) 
     RETURNING id, email, password_hash, name, is_premium, created_at, updated_at`,
    [email, passwordHash, name]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, email, password_hash, name, is_premium, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, email, password_hash, name, is_premium, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}
