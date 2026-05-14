const pool = require('../../common/database/pool');
const AppError = require('../../common/errors/AppError');
const { parsePagination, paginatedResponse } = require('../../common/utils/pagination');

async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const params = [];
  const conditions = ['a.deleted_at IS NULL'];

  if (query.patient_id) {
    params.push(query.patient_id);
    conditions.push(`a.patient_id = $${params.length}`);
  }
  if (query.doctor_id) {
    params.push(query.doctor_id);
    conditions.push(`a.doctor_id = $${params.length}`);
  }
  if (query.status) {
    params.push(query.status);
    conditions.push(`a.status = $${params.length}`);
  }
  if (query.date_from) {
    params.push(query.date_from);
    conditions.push(`a.appointment_date >= $${params.length}`);
  }
  if (query.date_to) {
    params.push(query.date_to);
    conditions.push(`a.appointment_date <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM appointments a ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT a.*,
            jsonb_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name) AS patient,
            jsonb_build_object('id', d.id, 'first_name', d.first_name, 'last_name', d.last_name, 'specialization', d.specialization) AS doctor,
            jsonb_build_object('id', r.id, 'first_name', r.first_name, 'last_name', r.last_name) AS receptionist
     FROM appointments a
     LEFT JOIN patients p ON p.id = a.patient_id AND p.deleted_at IS NULL
     LEFT JOIN doctors d ON d.id = a.doctor_id AND d.deleted_at IS NULL
     LEFT JOIN receptionists r ON r.id = a.receptionist_id AND r.deleted_at IS NULL
     ${where}
     ORDER BY a.appointment_date DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginatedResponse(rows, total, page, limit);
}

async function getById(id) {
  const { rows } = await pool.query(
    `SELECT a.*,
            jsonb_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name) AS patient,
            jsonb_build_object('id', d.id, 'first_name', d.first_name, 'last_name', d.last_name, 'specialization', d.specialization) AS doctor,
            jsonb_build_object('id', r.id, 'first_name', r.first_name, 'last_name', r.last_name) AS receptionist
     FROM appointments a
     LEFT JOIN patients p ON p.id = a.patient_id AND p.deleted_at IS NULL
     LEFT JOIN doctors d ON d.id = a.doctor_id AND d.deleted_at IS NULL
     LEFT JOIN receptionists r ON r.id = a.receptionist_id AND r.deleted_at IS NULL
     WHERE a.id = $1 AND a.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  return rows[0];
}

async function create(data, userId) {
  const { rows: receptionists } = await pool.query(
    'SELECT id FROM receptionists WHERE user_id = $1 AND deleted_at IS NULL',
    [userId],
  );
  const receptionistId = receptionists.length > 0 ? receptionists[0].id : null;

  const { rows } = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, receptionist_id, appointment_date, reason, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.patient_id,
      data.doctor_id || null,
      receptionistId,
      data.appointment_date,
      data.reason || null,
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
    `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return rows[0];
}

async function remove(id) {
  await getById(id);
  await pool.query('UPDATE appointments SET deleted_at = now() WHERE id = $1', [id]);
}

module.exports = { list, getById, create, update, remove };
