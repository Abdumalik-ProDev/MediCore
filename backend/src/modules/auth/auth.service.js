const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../common/database/pool');
const config = require('../../common/config/env');
const AppError = require('../../common/errors/AppError');

async function login(email, password) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
  if (rows.length === 0) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  return { token, user: payload };
}

async function getMe(userId) {
  const { rows } = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return rows[0];
}

module.exports = { login, getMe };
