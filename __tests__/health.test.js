const request = require('supertest');
const app = require('../src/app');

describe('Health endpoint', () => {
  it('GET /api/health → 200 {status:"ok"}', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
