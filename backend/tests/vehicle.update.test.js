
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

describe('PUT /api/vehicles/:id', () => {
  let token, vehicle;

  beforeEach(async () => {
    const user = await User.create({ name: 'Editor', email: 'editor@example.com', password: 'password123' });
    token = jwt.sign({ id: user._id }, JWT_SECRET);

    vehicle = await Vehicle.create({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });
  });

  it('rejects requests with no token', async () => {
    const res = await request(app).put(`/api/vehicles/${vehicle._id}`).send({ price: 21000 });
    expect(res.statusCode).toBe(401);
  });

  it('updates a vehicle successfully', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 21000, quantity: 8 });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(21000);
    expect(res.body.quantity).toBe(8);
    expect(res.body.make).toBe('Toyota'); // unchanged fields remain
  });

  it('returns 404 for a non-existent vehicle id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/vehicles/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 21000 });
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an invalid vehicle id format', async () => {
    const res = await request(app)
      .put('/api/vehicles/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 21000 });
    expect(res.statusCode).toBe(400);
  });

  it('rejects negative price or quantity on update', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: -500 });
    expect(res.statusCode).toBe(400);
  });
});