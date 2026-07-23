// tests/vehicle.purchase.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Vehicle = require('../src/models/vehicle');
const { JWT_SECRET } = require('../src/config/jwt');
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
  await Vehicle.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
}, 30000);

describe('POST /api/vehicles/:id/purchase', () => {
  let token;

  beforeEach(async () => {
    const user = await User.create({ name: 'Buyer', email: 'buyer@example.com', password: 'password123' });
    token = jwt.sign({ id: user._id }, JWT_SECRET);
  });

  it('rejects requests with no token', async () => {
    const vehicle = await Vehicle.create({ make: 'Kia', model: 'Seltos', category: 'SUV', price: 24000, quantity: 3 });
    const res = await request(app).post(`/api/vehicles/${vehicle._id}/purchase`);
    expect(res.statusCode).toBe(401);
  });

  it('decreases quantity by 1 on a successful purchase', async () => {
    const vehicle = await Vehicle.create({ make: 'Kia', model: 'Seltos', category: 'SUV', price: 24000, quantity: 3 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.quantity).toBe(2);
  });

  it('rejects purchase when quantity is already 0', async () => {
    const vehicle = await Vehicle.create({ make: 'Kia', model: 'Seltos', category: 'SUV', price: 24000, quantity: 0 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/out of stock/i);
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/vehicles/${fakeId}/purchase`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an invalid vehicle id format', async () => {
    const res = await request(app)
      .post('/api/vehicles/not-a-valid-id/purchase')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});
