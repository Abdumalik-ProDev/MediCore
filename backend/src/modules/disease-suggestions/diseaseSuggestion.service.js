const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const status = query.status || '';
  const search = query.search || '';
  const params = [];
  const conditions = [];

  if (status) {
    params.push(status);
    conditions.push(`ds.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`ds.disease_name ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM disease_suggestions ds ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT ds.*,
            jsonb_build_object('id', sug.id, 'first_name', sug.first_name, 'last_name', sug.last_name) AS suggested_by_user,
            CASE WHEN ds.reviewed_by IS NOT NULL THEN
              jsonb_build_object('id', rev.id, 'first_name', rev.first_name, 'last_name', rev.last_name)
            ELSE NULL END AS reviewed_by_user
     FROM disease_suggestions ds
     LEFT JOIN users sug ON sug.id = ds.suggested_by
     LEFT JOIN users rev ON rev.id = ds.reviewed_by
     ${where}
     ORDER BY ds.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT ds.*,
            jsonb_build_object('id', sug.id, 'first_name', sug.first_name, 'last_name', sug.last_name) AS suggested_by_user,
            CASE WHEN ds.reviewed_by IS NOT NULL THEN
              jsonb_build_object('id', rev.id, 'first_name', rev.first_name, 'last_name', rev.last_name)
            ELSE NULL END AS reviewed_by_user
     FROM disease_suggestions ds
     LEFT JOIN users sug ON sug.id = ds.suggested_by
     LEFT JOIN users rev ON rev.id = ds.reviewed_by
     WHERE ds.id = $1`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Suggestion not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO disease_suggestions (disease_name, description, icd_code, severity, suggested_category_id, suggested_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.disease_name,
      data.description || null,
      data.icd_code || null,
      data.severity || 'moderate',
      data.suggested_category_id || null,
      userId,
    ],
  );
  return rows[0];
}

async function review(id, data, adminId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: checkRows } = await client.query(
      `SELECT status FROM disease_suggestions WHERE id = $1 FOR UPDATE`,
      [id],
    );
    if (checkRows.length === 0) {
      throw new AppError('Suggestion not found', 404, 'NOT_FOUND');
    }
    if (checkRows[0].status !== 'pending') {
      throw new AppError('Suggestion has already been reviewed', 400, 'ALREADY_REVIEWED');
    }

    const { rows: updatedRows } = await client.query(
      `UPDATE disease_suggestions
       SET status = $1, reviewed_by = $2, reviewed_at = now(), admin_notes = $3
       WHERE id = $4
       RETURNING *`,
      [data.status, adminId, data.admin_notes || null, id],
    );
    const suggestion = updatedRows[0];

    if (data.status === 'approved') {
      let categoryId = suggestion.suggested_category_id;

      if (!categoryId) {
        const catResult = await client.query(
          `SELECT id FROM disease_categories WHERE name = 'Uncategorized'`,
        );
        if (catResult.rows.length > 0) {
          categoryId = catResult.rows[0].id;
        } else {
          const newCat = await client.query(
            `INSERT INTO disease_categories (name, description)
             VALUES ('Uncategorized', 'Default category for unclassified diseases')
             ON CONFLICT (name) DO NOTHING
             RETURNING id`,
          );
          if (newCat.rows.length > 0) {
            categoryId = newCat.rows[0].id;
          } else {
            const retry = await client.query(
              `SELECT id FROM disease_categories WHERE name = 'Uncategorized'`,
            );
            categoryId = retry.rows[0].id;
          }
        }
      }

      await client.query(
        `INSERT INTO diseases (category_id, name, description, icd_code, severity)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (category_id, name) DO NOTHING`,
        [categoryId, suggestion.disease_name, suggestion.description, suggestion.icd_code, suggestion.severity || 'moderate'],
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getById(id);
}

async function remove(id) {
  await getById(id);
  await pool.query('DELETE FROM disease_suggestions WHERE id = $1', [id]);
}

module.exports = { list, getById, create, review, remove };
