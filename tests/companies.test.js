const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Before each test, start a new transaction
beforeEach(async () => {
  await db.query("BEGIN");
});

// After each test, rollback the transaction to ensure test isolation
afterEach(async () => {
  await db.query("ROLLBACK");
});

// After all tests, close the database connection
afterAll(async () => {
  await db.end();
});

describe('GET /companies', () => {
  test('It should respond with a list of companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: expect.any(Array)
    });
  });
});

describe('POST /companies', () => {
  test('It should create a new company', async () => {
    const res = await request(app)
      .post('/companies')
      .send({ name: 'New Company', description: 'A new company' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code: 'new-company', name: 'New Company', description: 'A new company' }
    });
  });
});

describe('GET /companies/:code', () => {
  test('It should return a company by code', async () => {
    const res = await request(app).get('/companies/apple');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: expect.objectContaining({ code: 'apple', name: expect.any(String), description: expect.any(String) })
    });
  });

  test('It should return 404 for a company not found', async () => {
    const res = await request(app).get('/companies/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /companies/:code', () => {
  test('It should update a company', async () => {
    const res = await request(app)
      .put('/companies/apple')
      .send({ name: 'Updated Company', description: 'Updated description' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: 'apple', name: 'Updated Company', description: 'Updated description' }
    });
  });

  test('It should return 404 for a company not found', async () => {
    const res = await request(app).put('/companies/nonexistent').send({ name: 'Updated Company', description: 'Updated description' });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /companies/:code', () => {
  test('It should delete a company', async () => {
    const res = await request(app).delete('/companies/apple');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });

  test('It should return 404 for a company not found', async () => {
    const res = await request(app).delete('/companies/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});
