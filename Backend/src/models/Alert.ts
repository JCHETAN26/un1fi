import pool from '../config/database';

export type AlertType = 'price_threshold' | 'maturity_reminder' | 'rebalance_reminder';

export interface Alert {
  id: string;
  user_id: string;
  investment_id?: string;
  portfolio_id?: string;
  alert_type: AlertType;
  trigger_value?: number;
  message: string;
  is_active: boolean;
  triggered_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export async function createAlert(
  userId: string,
  alertType: AlertType,
  message: string,
  investmentId?: string,
  portfolioId?: string,
  triggerValue?: number
): Promise<Alert> {
  const result = await pool.query(
    `INSERT INTO alerts (user_id, investment_id, portfolio_id, alert_type, trigger_value, message, is_active) 
     VALUES ($1, $2, $3, $4, $5, $6, true) 
     RETURNING *`,
    [userId, investmentId || null, portfolioId || null, alertType, triggerValue || null, message]
  );
  return result.rows[0];
}

export async function getAlertsByUserId(userId: string): Promise<Alert[]> {
  const result = await pool.query(
    `SELECT * FROM alerts WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function markAlertAsTriggered(alertId: string): Promise<Alert> {
  const result = await pool.query(
    `UPDATE alerts SET triggered_at = NOW(), is_active = false WHERE id = $1 RETURNING *`,
    [alertId]
  );
  return result.rows[0];
}

export async function deleteAlert(alertId: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM alerts WHERE id = $1', [alertId]);
  return result.rowCount! > 0;
}
