const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const search = query.search || '';
  let where = 'WHERE d.deleted_at IS NULL';
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (d.first_name ILIKE $${params.length} OR d.last_name ILIKE $${params.length} OR d.specialization ILIKE $${params.length})`;
  }
  const countResult = await pool.query(`SELECT COUNT(*) FROM doctors d ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);
  params.push(limit);
  params.push(offset);
  const { rows } = await pool.query(
    `SELECT d.*, u.email as user_email
     FROM doctors d
     LEFT JOIN users u ON u.id = d.user_id
     ${where}
     ORDER BY d.last_name, d.first_name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT d.*, u.email as user_email
     FROM doctors d
     LEFT JOIN users u ON u.id = d.user_id
     WHERE d.id = $1 AND d.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Doctor not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO doctors (first_name, last_name, specialization, license_number, phone, email)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.first_name, data.last_name, data.specialization, data.license_number, data.phone || null, data.email || null],
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
  fields.push(`updated_at = now()`);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE doctors SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return rows[0];
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE doctors SET deleted_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
