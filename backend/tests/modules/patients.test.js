const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock('pg', () => {
  const pool = { query: mockQuery, connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }), on: jest.fn() };
  return { Pool: jest.fn(() => pool) };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const token = jwt.sign({ id: 'u1', role: 'admin' }, 'test-secret');

describe('Patients Module', () => {
  beforeEach(() => { process.env.JWT_SECRET = 'test-secret'; });

  describe('GET /api/v1/patients', () => {
    it('should list paginated patients', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'p1', first_name: 'Emily', last_name: 'Johnson', date_of_birth: '1985-03-12', gender: 'Female', phone: '555-1001', blood_group: 'A+', deleted_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), doctor_id: 'd1', doctor: { id: 'd1', first_name: 'Sarah', last_name: 'Chen', specialization: 'Cardiology' } }],
      });
      const res = await request(app).get('/api/v1/patients').set('Authorization', `Bearer ${token}`).expect(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/patients/:id/profile', () => {
    it('should return patient with diagnoses', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'p1', first_name: 'Emily', last_name: 'Johnson', date_of_birth: '1985-03-12', gender: 'Female', phone: '555-1001', blood_group: 'A+', deleted_at: null, doctor: { id: 'd1', first_name: 'Sarah', last_name: 'Chen', specialization: 'Cardiology' } }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'dx1', diagnosis_name: 'Hypertension', diagnosis_code: 'I10', severity: 'moderate', status: 'active', diagnosed_date: '2025-11-15', description: '', notes: '', doctor: { id: 'd1', first_name: 'Sarah', last_name: 'Chen' } }] });
      const res = await request(app).get('/api/v1/patients/p1/profile').set('Authorization', `Bearer ${token}`).expect(200);
      expect(res.body.data).toHaveProperty('diagnoses');
      expect(res.body.data.diagnoses).toHaveLength(1);
    });
  });

  describe('POST /api/v1/patients', () => {
    it('should create patient', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'p2', first_name: 'New', last_name: 'Patient', date_of_birth: '1990-01-01' }] });
      const res = await request(app).post('/api/v1/patients').set('Authorization', `Bearer ${token}`)
        .send({ first_name: 'New', last_name: 'Patient', date_of_birth: '1990-01-01' }).expect(201);
      expect(res.body.data).toHaveProperty('id');
    });
  });
});
