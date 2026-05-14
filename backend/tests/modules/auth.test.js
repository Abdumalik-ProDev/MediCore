const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock('pg', () => {
  const pool = { query: mockQuery, connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }), on: jest.fn() };
  return { Pool: jest.fn(() => pool) };
});

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const hashedPassword = bcrypt.hashSync('password123', 10);

describe('Auth Module', () => {
  beforeEach(() => { process.env.JWT_SECRET = 'test-secret'; });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 for missing fields', async () => {
      await request(app).post('/api/v1/auth/login').send({}).expect(400);
    });

    it('should return 401 for invalid email', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'unknown@test.com', password: 'password123' })
        .expect(401);
    });

    it('should return 401 for wrong password', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'u1', email: 'test@test.com', password_hash: hashedPassword, role: 'admin', is_active: true }],
      });
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpass1' })
        .expect(401);
    });

    it('should login successfully', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'u1', email: 'admin@medicore.com', password_hash: hashedPassword, role: 'admin', is_active: true }],
      });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@medicore.com', password: 'password123' })
        .expect(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({ email: 'admin@medicore.com', role: 'admin' });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      await request(app).get('/api/v1/auth/me').expect(401);
    });

    it('should return user with valid token', async () => {
      const token = jwt.sign({ id: 'u1', email: 'admin@medicore.com', role: 'admin' }, 'test-secret');
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'u1', email: 'admin@medicore.com', role: 'admin', created_at: new Date().toISOString() }],
      });
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data).toMatchObject({ email: 'admin@medicore.com', role: 'admin' });
    });
  });
});
