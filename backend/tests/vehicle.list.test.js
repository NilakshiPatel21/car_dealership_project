
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

describe('GET /api/vehicles', () => {
  let token;

  beforeEach(async () => {
    const user = await User.create({ name: 'Viewer', email: 'viewer@example.com', password: 'password123' });
    token = jwt.sign({ id: user._id }, JWT_SECRET);

    await Vehicle.create([
      { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 },
      { make: 'Ford', model: 'F-150', category: 'Truck', price: 35000, quantity: 3 },
      { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000, quantity: 0 },
    ]);
  });

  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toBe(401);
  });

  it('returns all vehicles for a logged-in user', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
  });
});

describe('GET /api/vehicles/search', () => {
  let token;

  beforeEach(async () => {
    const user = await User.create({ name: 'Viewer2', email: 'viewer2@example.com', password: 'password123' });
    token = jwt.sign({ id: user._id }, JWT_SECRET);

    await Vehicle.create([
      { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 },
      { make: 'Ford', model: 'F-150', category: 'Truck', price: 35000, quantity: 3 },
      { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000, quantity: 0 },
    ]);
  });

  it('filters by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=Truck')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].make).toBe('Ford');
  });

  it('filters by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=25000&maxPrice=30000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].model).toBe('RAV4');
  });

  it('returns empty array when nothing matches', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Nonexistent')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});