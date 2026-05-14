const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const search = query.search || '';
  const categoryId = query.category_id || '';
  const params = [];
  const conditions = ['d.is_active = true'];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(d.name ILIKE $${params.length} OR d.icd_code ILIKE $${params.length})`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`d.category_id = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM diseases d ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit);
  params.push(offset);
  const { rows } = await pool.query(
    `SELECT d.*, jsonb_build_object('id', c.id, 'name', c.name, 'description', c.description, 'icon', c.icon) AS category
     FROM diseases d
     LEFT JOIN disease_categories c ON c.id = d.category_id
     ${where}
     ORDER BY d.name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT d.*, jsonb_build_object('id', c.id, 'name', c.name, 'description', c.description, 'icon', c.icon) AS category
     FROM diseases d
     LEFT JOIN disease_categories c ON c.id = d.category_id
     WHERE d.id = $1 AND d.is_active = true`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Disease not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO diseases (category_id, name, description, icd_code, severity)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.category_id, data.name, data.description || null, data.icd_code || null, data.severity],
    );
    const disease = await getById(rows[0].id);
    return disease;
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'diseases_category_id_name_key') {
      throw new AppError('A disease with this name already exists in the selected category', 409, 'DUPLICATE_DISEASE');
    }
    if (err.code === '23503' && err.constraint === 'diseases_category_id_fkey') {
      throw new AppError('Category not found', 400, 'INVALID_CATEGORY');
    }
    throw err;
  }
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
  try {
    const { rows } = await pool.query(
      `UPDATE diseases SET ${fields.join(', ')} WHERE id = $${idx} AND is_active = true RETURNING *`,
      params,
    );
    const disease = await getById(rows[0].id);
    return disease;
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'diseases_category_id_name_key') {
      throw new AppError('A disease with this name already exists in the selected category', 409, 'DUPLICATE_DISEASE');
    }
    if (err.code === '23503' && err.constraint === 'diseases_category_id_fkey') {
      throw new AppError('Category not found', 400, 'INVALID_CATEGORY');
    }
    throw err;
  }
}

async function remove(id) {
  await getById(id);
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM medical_records WHERE disease_id = $1 AND deleted_at IS NULL`,
    [id],
  );
  if (parseInt(rows[0].cnt, 10) > 0) {
    throw new AppError('Cannot delete disease with active medical records', 409, 'HAS_REFERENCES');
  }
  await pool.query('UPDATE diseases SET is_active = false, updated_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
