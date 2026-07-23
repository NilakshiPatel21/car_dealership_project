// tests/middleware.auth.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, adminOnly } = require('../src/middleware/auth');
const { JWT_SECRET } = require('../src/config/jwt');
const User = require('../src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const app = express();
app.use(express.json());
app.get('/protected', protect, (req, res) => res.status(200).json({ user: req.user }));
app.get('/admin-only', protect, adminOnly, (req, res) => res.status(200).json({ ok: true }));

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(MONGO_URI);
}, 60000);

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
}, 30000);

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

  it('rejects a token for a user that no longer exists', async () => {
    const fakeButValidId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: fakeButValidId }, JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(401);
  });

  it('allows requests with a valid token for a real user', async () => {
    const user = await User.create({ name: 'Test', email: 'mw@example.com', password: 'password123' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user._id).toBe(user._id.toString());
  });
});

describe('adminOnly middleware', () => {
  it('blocks non-admin users with 403', async () => {
    const user = await User.create({ name: 'Customer', email: 'cust@example.com', password: 'password123', role: 'customer' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('allows admin users', async () => {
    const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' });
    const token = jwt.sign({ id: admin._id }, JWT_SECRET);
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});