const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'mysecretpassword',
  port: 5432,
});

module.exports = {
  getReferrer: async userId => {
    const res = await pool.query('SELECT referred_by FROM users WHERE id = $1', [userId]);
    return res.rows[0]?.referred_by || null;
  },

  recordPurchase: async (userId, amount) => {
    const res = await pool.query(
      'INSERT INTO purchases (user_id, amount, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [userId, amount]
    );
    return res.rows[0].id;
  },

  recordEarning: async (userId, fromUserId, level, amount, purchaseId) => {
    await pool.query(
      'INSERT INTO earnings (user_id, source_user_id, level, amount, purchase_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, fromUserId, level, amount, purchaseId]
    );
  },

  getEarningsReport: async userId => {
    const res = await pool.query(
      `SELECT level, SUM(amount) AS total, COUNT(*) AS entries
       FROM earnings WHERE user_id = $1 GROUP BY level`,
      [userId]
    );
    return res.rows;
  }
};
