// tests/middleware.auth.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../src/middleware/auth');
const { JWT_SECRET } = require('../src/config/jwt');

const app = express();
app.use(express.json());
app.get('/protected', protect, (req, res) => res.status(200).json({ user: req.user }));
app.get('/admin-only', protect, adminOnly, (req, res) => res.status(200).json({ ok: true }));

describe('protect middleware', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer garbage.token.here');
    expect(res.statusCode).toBe(401);
  });

  it('allows requests with a valid token and attaches req.user', async () => {
    const token = jwt.sign({ id: 'user123', role: 'customer' }, JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe('user123');
  });
});

describe('adminOnly middleware', () => {
  it('blocks non-admin users with 403', async () => {
    const token = jwt.sign({ id: 'user123', role: 'customer' }, JWT_SECRET);
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('allows admin users', async () => {
    const token = jwt.sign({ id: 'admin1', role: 'admin' }, JWT_SECRET);
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});