const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const search = query.search || '';
  const params = [];
  const conditions = ['r.deleted_at IS NULL'];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(r.first_name ILIKE $${params.length} OR r.last_name ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM receptionists r ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT r.*, u.email as user_email
     FROM receptionists r
     LEFT JOIN users u ON u.id = r.user_id
     ${where}
     ORDER BY r.last_name, r.first_name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT r.*, u.email as user_email
     FROM receptionists r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.id = $1 AND r.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Receptionist not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO receptionists (first_name, last_name, phone, email, user_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.first_name, data.last_name, data.phone || null, data.email || null, data.user_id || null],
  );
  return rows[0];
}

async function update(id, data) {
  await getById(id);
  const fields = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(value);
    }
  }
  if (fields.length === 0) return getById(id);
  fields.push('updated_at = now()');
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE receptionists SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return rows[0];
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE receptionists SET deleted_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
