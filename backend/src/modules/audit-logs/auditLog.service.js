const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const params = [];
  const conditions = [];

  if (query.action) {
    params.push(query.action);
    conditions.push(`a.action = $${params.length}`);
  }
  if (query.entity_type) {
    params.push(query.entity_type);
    conditions.push(`a.entity_type = $${params.length}`);
  }
  if (query.user_id) {
    params.push(query.user_id);
    conditions.push(`a.user_id = $${params.length}`);
  }
  if (query.date_from) {
    params.push(query.date_from);
    conditions.push(`a.created_at >= $${params.length}`);
  }
  if (query.date_to) {
    params.push(query.date_to);
    conditions.push(`a.created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(`SELECT COUNT(*) FROM audit_logs a ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT a.*, u.email as user_email
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT a.*, u.email as user_email
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.id = $1`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Audit log not found', 404, 'NOT_FOUND');
  return rows[0];
}

module.exports = { list, getById };
