// tests/auth.login.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

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

describe('POST /api/auth/login', () => {
  const existingUser = { name: 'Login User', email: 'login@example.com', password: 'password123' };

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(existingUser);
  });

  it('logs in with correct credentials and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: existingUser.email, password: existingUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(existingUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: existingUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects login with missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: existingUser.email });
    expect(res.statusCode).toBe(400);
  });
});