// tests/vehicle.delete.test.js
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

describe('DELETE /api/vehicles/:id', () => {
  let customerToken, adminToken, vehicle;

  beforeEach(async () => {
    const customer = await User.create({ name: 'Cust', email: 'delcust@example.com', password: 'password123', role: 'customer' });
    const admin = await User.create({ name: 'Admin', email: 'deladmin@example.com', password: 'password123', role: 'admin' });
    customerToken = jwt.sign({ id: customer._id }, JWT_SECRET);
    adminToken = jwt.sign({ id: admin._id }, JWT_SECRET);

    vehicle = await Vehicle.create({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 20000, quantity: 4 });
  });

  it('rejects requests with no token', async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicle._id}`);
    expect(res.statusCode).toBe(401);
  });

  it('rejects a non-admin user with 403', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('allows an admin to delete a vehicle', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    const stillExists = await Vehicle.findById(vehicle._id);
    expect(stillExists).toBeNull();
  });

  it('returns 404 when deleting a non-existent vehicle', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/vehicles/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an invalid vehicle id format', async () => {
    const res = await request(app)
      .delete('/api/vehicles/not-a-valid-id')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });
});