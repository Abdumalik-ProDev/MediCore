const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const patientId = query.patient_id || '';
  const doctorId = query.doctor_id || '';
  const params = [];
  const conditions = ['d.deleted_at IS NULL'];

  if (patientId) {
    params.push(patientId);
    conditions.push(`d.patient_id = $${params.length}`);
  }
  if (doctorId) {
    params.push(doctorId);
    conditions.push(`d.doctor_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM diagnoses d ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT d.*,
            jsonb_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name) AS patient,
            jsonb_build_object('id', dr.id, 'first_name', dr.first_name, 'last_name', dr.last_name) AS doctor
     FROM diagnoses d
     LEFT JOIN patients p ON p.id = d.patient_id AND p.deleted_at IS NULL
     LEFT JOIN doctors dr ON dr.id = d.doctor_id AND dr.deleted_at IS NULL
     ${where}
     ORDER BY d.diagnosed_date DESC, d.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT d.*,
            jsonb_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name) AS patient,
            jsonb_build_object('id', dr.id, 'first_name', dr.first_name, 'last_name', dr.last_name) AS doctor
     FROM diagnoses d
     LEFT JOIN patients p ON p.id = d.patient_id AND p.deleted_at IS NULL
     LEFT JOIN doctors dr ON dr.id = d.doctor_id AND dr.deleted_at IS NULL
     WHERE d.id = $1 AND d.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Diagnosis not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO diagnoses (patient_id, doctor_id, diagnosis_code, diagnosis_name,
      description, severity, status, diagnosed_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      data.patient_id, data.doctor_id || null, data.diagnosis_code || null,
      data.diagnosis_name, data.description || null, data.severity,
      data.status, data.diagnosed_date || new Date().toISOString().split('T')[0],
      data.notes || null,
    ],
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
    `UPDATE diagnoses SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return rows[0];
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE diagnoses SET deleted_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
