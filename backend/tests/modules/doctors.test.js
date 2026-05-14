const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock('pg', () => {
  const pool = { query: mockQuery, connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }), on: jest.fn() };
  return { Pool: jest.fn(() => pool) };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const adminToken = jwt.sign({ id: 'u1', email: 'admin@test.com', role: 'admin' }, 'test-secret');
const clinicianToken = jwt.sign({ id: 'u2', email: 'clin@test.com', role: 'clinician' }, 'test-secret');

describe('Doctors Module', () => {
  beforeEach(() => { process.env.JWT_SECRET = 'test-secret'; });

  describe('GET /api/v1/doctors', () => {
    it('should return 401 without token', async () => {
      await request(app).get('/api/v1/doctors').expect(401);
    });

    it('should list paginated doctors', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '2' }] });
      mockQuery.mockResolvedValueOnce({
        rows: Array.from({ length: 2 }, (_, i) => ({
          id: `d${i + 1}`, first_name: `Doc${i + 1}`, last_name: 'Test',
          specialization: 'General', license_number: `LIC-00${i + 1}`,
          phone: `555-010${i + 1}`, email: `doc${i + 1}@test.com`,
          is_active: true, deleted_at: null, user_email: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        })),
      });
      const res = await request(app).get('/api/v1/doctors').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('POST /api/v1/doctors', () => {
    it('should reject non-admin', async () => {
      await request(app)
        .post('/api/v1/doctors').set('Authorization', `Bearer ${clinicianToken}`)
        .send({ first_name: 'X', last_name: 'Y', license_number: 'L3' }).expect(403);
    });

    it('should create doctor', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'd3', first_name: 'New', last_name: 'Doc', specialization: 'General', license_number: 'L3' }] });
      const res = await request(app)
        .post('/api/v1/doctors').set('Authorization', `Bearer ${adminToken}`)
        .send({ first_name: 'New', last_name: 'Doc', license_number: 'L3' }).expect(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should reject missing required', async () => {
      await request(app)
        .post('/api/v1/doctors').set('Authorization', `Bearer ${adminToken}`)
        .send({}).expect(400);
    });
  });

  describe('DELETE /api/v1/doctors/:id', () => {
    it('should soft delete', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'd1', deleted_at: null }] });
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await request(app).delete('/api/v1/doctors/d1').set('Authorization', `Bearer ${adminToken}`).expect(204);
    });
  });
});
