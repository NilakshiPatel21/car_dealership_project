// tests/errorHandling.test.js
const request = require('supertest');
const app = require('../src/app');
const AppError = require('../src/utils/AppError');
const errorHandler = require('../src/middleware/errorHandler');

describe('404 handler for unknown routes', () => {
  it('returns a consistent 404 JSON shape for an undefined route', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/not found/i);
  });
});

describe('AppError', () => {
  it('sets statusCode and status correctly for a 4xx error', () => {
    const err = new AppError('Bad input', 400);
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('sets status to error for a 5xx error', () => {
    const err = new AppError('Something broke', 500);
    expect(err.status).toBe('error');
  });
});

describe('errorHandler middleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('responds with the error\'s own statusCode and message when operational', () => {
    const err = new AppError('Vehicle not found', 404);
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'fail', message: 'Vehicle not found' })
    );
  });

  it('defaults to 500 and a generic message for unexpected errors', () => {
    const err = new Error('Unexpected DB crash');
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' })
    );
  });
});