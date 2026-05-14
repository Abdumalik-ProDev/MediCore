const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock('pg', () => {
  const pool = { query: mockQuery, connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }), on: jest.fn() };
  return { Pool: jest.fn(() => pool) };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const adminToken = jwt.sign({ id: 'u1', role: 'admin' }, 'test-secret');
const doctorToken = jwt.sign({ id: 'u2', role: 'doctor' }, 'test-secret');

describe('Diagnoses Module', () => {
  beforeEach(() => { process.env.JWT_SECRET = 'test-secret'; });

  describe('GET /api/v1/diagnoses', () => {
    it('should list paginated diagnoses', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'dx1', diagnosis_name: 'Hypertension', diagnosis_code: 'I10', severity: 'moderate', status: 'active', diagnosed_date: '2025-11-15', description: '', notes: '', deleted_at: null, patient: { id: 'p1', first_name: 'Emily', last_name: 'Johnson' }, doctor: { id: 'd1', first_name: 'Sarah', last_name: 'Chen' } }],
      });
      const res = await request(app).get('/api/v1/diagnoses').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/diagnoses', () => {
    it('should create for doctor', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'dx2', diagnosis_name: 'Asthma', diagnosis_code: 'J45.9', severity: 'mild', status: 'active', patient_id: 'p1' }] });
      const res = await request(app).post('/api/v1/diagnoses').set('Authorization', `Bearer ${doctorToken}`)
        .send({ patient_id: '00000000-0000-0000-0000-000000000001', diagnosis_name: 'Asthma' }).expect(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should reject without name', async () => {
      await request(app).post('/api/v1/diagnoses').set('Authorization', `Bearer ${doctorToken}`)
        .send({ patient_id: '00000000-0000-0000-0000-000000000001' }).expect(400);
    });

    it('should reject receptionist', async () => {
      const recToken = jwt.sign({ id: 'u3', role: 'receptionist' }, 'test-secret');
      await request(app).post('/api/v1/diagnoses').set('Authorization', `Bearer ${recToken}`)
        .send({ patient_id: '00000000-0000-0000-0000-000000000001', diagnosis_name: 'Asthma' }).expect(403);
    });
  });

  describe('DELETE /api/v1/diagnoses/:id', () => {
    it('should allow admin to delete', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'dx1', severity: 'moderate', status: 'active', deleted_at: null }] });
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await request(app).delete('/api/v1/diagnoses/dx1').set('Authorization', `Bearer ${adminToken}`).expect(204);
    });
  });
});
