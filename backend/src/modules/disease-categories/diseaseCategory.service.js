const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const search = query.search || '';
  let where = 'WHERE is_active = true';
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where += ` AND name ILIKE $${params.length}`;
  }
  const countResult = await pool.query(`SELECT COUNT(*) FROM disease_categories ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);
  params.push(limit);
  params.push(offset);
  const { rows } = await pool.query(
    `SELECT * FROM disease_categories
     ${where}
     ORDER BY name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM disease_categories WHERE id = $1 AND is_active = true',
    [id],
  );
  if (rows.length === 0) throw new AppError('Disease category not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data) {
  const existing = await pool.query(
    'SELECT id FROM disease_categories WHERE name ILIKE $1 AND is_active = true',
    [data.name],
  );
  if (existing.rows.length > 0) {
    throw new AppError('A disease category with this name already exists', 409, 'CONFLICT');
  }
  const { rows } = await pool.query(
    `INSERT INTO disease_categories (name, description, icon)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.name, data.description || null, data.icon || null],
  );
  return rows[0];
}

async function update(id, data) {
  await getById(id);
  if (data.name) {
    const existing = await pool.query(
      'SELECT id FROM disease_categories WHERE name ILIKE $1 AND id != $2 AND is_active = true',
      [data.name, id],
    );
    if (existing.rows.length > 0) {
      throw new AppError('A disease category with this name already exists', 409, 'CONFLICT');
    }
  }
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
    `UPDATE disease_categories SET ${fields.join(', ')} WHERE id = $${idx} AND is_active = true RETURNING *`,
    params,
  );
  return rows[0];
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE disease_categories SET is_active = false, updated_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
