// tests/vehicle.restock.test.js
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

describe('POST /api/vehicles/:id/restock', () => {
  let customerToken, adminToken;

  beforeEach(async () => {
    const customer = await User.create({ name: 'Cust', email: 'restockcust@example.com', password: 'password123', role: 'customer' });
    const admin = await User.create({ name: 'Admin', email: 'restockadmin@example.com', password: 'password123', role: 'admin' });
    customerToken = jwt.sign({ id: customer._id }, JWT_SECRET);
    adminToken = jwt.sign({ id: admin._id }, JWT_SECRET);
  });

  it('rejects requests with no token', async () => {
    const vehicle = await Vehicle.create({ make: 'Mazda', model: 'CX-5', category: 'SUV', price: 26000, quantity: 2 });
    const res = await request(app).post(`/api/vehicles/${vehicle._id}/restock`).send({ amount: 5 });
    expect(res.statusCode).toBe(401);
  });

  it('rejects a non-admin user with 403', async () => {
    const vehicle = await Vehicle.create({ make: 'Mazda', model: 'CX-5', category: 'SUV', price: 26000, quantity: 2 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ amount: 5 });
    expect(res.statusCode).toBe(403);
  });

  it('increases quantity by the given amount', async () => {
    const vehicle = await Vehicle.create({ make: 'Mazda', model: 'CX-5', category: 'SUV', price: 26000, quantity: 2 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.quantity).toBe(7);
  });

  it('rejects a missing or non-positive amount', async () => {
    const vehicle = await Vehicle.create({ make: 'Mazda', model: 'CX-5', category: 'SUV', price: 26000, quantity: 2 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -3 });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/vehicles/${fakeId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an invalid vehicle id format', async () => {
    const res = await request(app)
      .post('/api/vehicles/not-a-valid-id/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });
    expect(res.statusCode).toBe(400);
  });
});