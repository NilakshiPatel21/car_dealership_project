// tests/vehicle.create.test.js
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

describe('POST /api/vehicles', () => {
  let customerToken, adminToken;

  beforeEach(async () => {
    const customer = await User.create({
       name: 'Cust',
        email: 'cust@example.com', 
        password: 'password123', 
        role: 'customer' 
      });
    
      const admin = await User.create({
       name: 'Admin', 
       email: 'admin2@example.com', 
       password: 'password123', 
       role: 'admin' 
      });
    customerToken = jwt.sign({ id: customer._id }, JWT_SECRET);
    adminToken = jwt.sign({ id: admin._id }, JWT_SECRET);
  });

  const validVehicle = { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 };

  it('rejects requests with no token', async () => {
    const res = await request(app).post('/api/vehicles').send(validVehicle);
    expect(res.statusCode).toBe(401);
  });

  it('allows a logged-in customer to add a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(validVehicle);
    expect(res.statusCode).toBe(201);
    expect(res.body.make).toBe('Toyota');
    expect(res.body.quantity).toBe(5);
  });

  it('rejects vehicle creation with missing required fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects negative price or quantity', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicle, price: -100 });
    expect(res.statusCode).toBe(400);
  });
});



