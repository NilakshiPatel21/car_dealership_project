// tests/auth.register.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

// Mock Mongoose model — no real DB connection needed
jest.mock('../src/models/User');

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const mockUser = {
      _id: 'abc123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
    };

    User.findOne.mockResolvedValue(null);       // no duplicate
    User.create.mockResolvedValue(mockUser);    // creation succeeds

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email registration', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' }); // duplicate exists

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Another', email: 'dupe@example.com', password: 'password456' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects missing required fields', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@x.com' }); // no name or password

    expect(res.statusCode).toBe(400);
  });

  it('stores the password hashed, not in plain text', async () => {
    let capturedData;

    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation(async (data) => {
      // Simulate the pre-save hook: hash the password before storing
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(data.password, salt);
      capturedData = { ...data, password: hashed };
      return { _id: 'abc123', name: data.name, email: data.email, role: 'customer' };
    });

    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'hash@example.com', password: 'password123' });

    expect(capturedData.password).not.toBe('password123');
    const isHashed = await bcrypt.compare('password123', capturedData.password);
    expect(isHashed).toBe(true);
  });
});
