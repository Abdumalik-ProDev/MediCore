const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const search = query.search || '';
  const doctorId = query.doctor_id || '';
  const params = [];
  const conditions = ['p.deleted_at IS NULL'];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.first_name ILIKE $${params.length} OR p.last_name ILIKE $${params.length})`);
  }
  if (doctorId) {
    params.push(doctorId);
    conditions.push(`p.doctor_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM patients p ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT p.*,
            jsonb_build_object('id', d.id, 'first_name', d.first_name, 'last_name', d.last_name, 'specialization', d.specialization) AS doctor
     FROM patients p
     LEFT JOIN doctors d ON d.id = p.doctor_id AND d.deleted_at IS NULL
     ${where}
     ORDER BY p.last_name, p.first_name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT p.*,
            jsonb_build_object('id', d.id, 'first_name', d.first_name, 'last_name', d.last_name, 'specialization', d.specialization) AS doctor
     FROM patients p
     LEFT JOIN doctors d ON d.id = p.doctor_id AND d.deleted_at IS NULL
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Patient not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function getProfile(id) {
  const patient = await getById(id);
  const { rows: diagnoses } = await pool.query(
    `SELECT d.*,
            jsonb_build_object('id', dr.id, 'first_name', dr.first_name, 'last_name', dr.last_name) AS doctor
     FROM diagnoses d
     LEFT JOIN doctors dr ON dr.id = d.doctor_id AND dr.deleted_at IS NULL
     WHERE d.patient_id = $1 AND d.deleted_at IS NULL
     ORDER BY d.diagnosed_date DESC`,
    [id],
  );
  return { ...patient, diagnoses };
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO patients (doctor_id, first_name, last_name, date_of_birth, gender, phone, email,
      address, blood_group, allergies, emergency_contact, emergency_phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      data.doctor_id || null, data.first_name, data.last_name, data.date_of_birth,
      data.gender || null, data.phone || null, data.email || null,
      data.address || null, data.blood_group || null, data.allergies || null,
      data.emergency_contact || null, data.emergency_phone || null,
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
    `UPDATE patients SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return rows[0];
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE patients SET deleted_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, getProfile, create, update, remove };
