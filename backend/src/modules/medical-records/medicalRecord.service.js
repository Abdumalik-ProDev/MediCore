const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const patientId = query.patient_id || '';
  const doctorId = query.doctor_id || '';
  const diseaseId = query.disease_id || '';
  const params = [];
  const conditions = ['mr.deleted_at IS NULL'];

  if (patientId) {
    params.push(patientId);
    conditions.push(`mr.patient_id = $${params.length}`);
  }
  if (doctorId) {
    params.push(doctorId);
    conditions.push(`mr.doctor_id = $${params.length}`);
  }
  if (diseaseId) {
    params.push(diseaseId);
    conditions.push(`mr.disease_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM medical_records mr ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT mr.*,
            jsonb_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name) AS patient,
            jsonb_build_object('id', dr.id, 'first_name', dr.first_name, 'last_name', dr.last_name) AS doctor,
            jsonb_build_object('id', d.id, 'name', d.name, 'icd_code', d.icd_code, 'severity', d.severity) AS disease,
            jsonb_build_object('id', dc.id, 'name', dc.name) AS disease_category
     FROM medical_records mr
     LEFT JOIN patients p ON p.id = mr.patient_id AND p.deleted_at IS NULL
     LEFT JOIN doctors dr ON dr.id = mr.doctor_id AND dr.deleted_at IS NULL
     LEFT JOIN diseases d ON d.id = mr.disease_id
     LEFT JOIN disease_categories dc ON dc.id = d.category_id
     ${where}
     ORDER BY mr.diagnosed_date DESC, mr.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT mr.*,
            jsonb_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name) AS patient,
            jsonb_build_object('id', dr.id, 'first_name', dr.first_name, 'last_name', dr.last_name) AS doctor,
            jsonb_build_object('id', d.id, 'name', d.name, 'icd_code', d.icd_code, 'severity', d.severity) AS disease,
            jsonb_build_object('id', dc.id, 'name', dc.name) AS disease_category
     FROM medical_records mr
     LEFT JOIN patients p ON p.id = mr.patient_id AND p.deleted_at IS NULL
     LEFT JOIN doctors dr ON dr.id = mr.doctor_id AND dr.deleted_at IS NULL
     LEFT JOIN diseases d ON d.id = mr.disease_id
     LEFT JOIN disease_categories dc ON dc.id = d.category_id
     WHERE mr.id = $1 AND mr.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Medical record not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data) {
  const diseaseCheck = await pool.query(
    'SELECT id FROM diseases WHERE id = $1 AND is_active = true',
    [data.disease_id],
  );
  if (diseaseCheck.rows.length === 0) {
    throw new AppError('Disease not found or inactive in registry', 400, 'INVALID_DISEASE');
  }

  const patientCheck = await pool.query(
    'SELECT id FROM patients WHERE id = $1 AND deleted_at IS NULL',
    [data.patient_id],
  );
  if (patientCheck.rows.length === 0) {
    throw new AppError('Patient not found', 404, 'NOT_FOUND');
  }

  const { rows } = await pool.query(
    `INSERT INTO medical_records (patient_id, doctor_id, disease_id, severity, status, diagnosed_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      data.patient_id, data.doctor_id || null, data.disease_id,
      data.severity, data.status,
      data.diagnosed_date || new Date().toISOString().split('T')[0],
      data.notes || null,
    ],
  );
  return getById(rows[0].id);
}

async function update(id, data) {
  await getById(id);
  if (data.disease_id) {
    const diseaseCheck = await pool.query(
      'SELECT id FROM diseases WHERE id = $1 AND is_active = true',
      [data.disease_id],
    );
    if (diseaseCheck.rows.length === 0) {
      throw new AppError('Disease not found or inactive in registry', 400, 'INVALID_DISEASE');
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
    `UPDATE medical_records SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return getById(rows[0].id);
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE medical_records SET deleted_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
