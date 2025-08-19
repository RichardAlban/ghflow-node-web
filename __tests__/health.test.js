const request = require('supertest');
const app = require('../src/app');

describe('Contact endpoint', () => {
  it('POST /api/contact → 400 si faltan campos', async () => {
    const res = await request(app).post('/api/contact').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/contact → 201 y devuelve id', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Ana',
      email: 'ana@test.com',
      message: 'Hola'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
