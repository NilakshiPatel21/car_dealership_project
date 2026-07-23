// tests/auth.register.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
});

afterEach(async () => {
  await User.deleteMany({}); // clean slate between tests
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user).not.toHaveProperty('password'); // never leak password
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'dupe@example.com', password: 'password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another', email: 'dupe@example.com', password: 'password456',
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.statusCode).toBe(400);
  });

  it('stores the password hashed, not in plain text', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'hash@example.com', password: 'password123',
    });
    const user = await User.findOne({ email: 'hash@example.com' }).select('+password');
    expect(user.password).not.toBe('password123');
  });
});
