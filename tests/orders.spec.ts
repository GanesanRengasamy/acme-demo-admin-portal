import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';

const app = createApp();

describe('GET /orders', () => {
  it('returns the first 50 orders by default', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(50);
    expect(res.body[0].id).toBe(1);
    expect(res.body[49].id).toBe(50);
    expect(Object.keys(res.body[0]).sort()).toEqual(['createdAt', 'customer', 'email', 'id', 'status', 'total']);
  });

  it('returns the requested number of orders', async () => {
    const res = await request(app).get('/orders?limit=10');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(res.body[0].id).toBe(1);
    expect(res.body[9].id).toBe(10);
  });

  it('returns the maximum allowed number of orders', async () => {
    const res = await request(app).get('/orders?limit=200');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(200);
  });

  it('skips the given number of orders', async () => {
    const res = await request(app).get('/orders?limit=10&offset=20');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(res.body[0].id).toBe(21);
    expect(res.body[9].id).toBe(30);
  });

  it('supports an offset without a limit', async () => {
    const res = await request(app).get('/orders?offset=150');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(50);
    expect(res.body[0].id).toBe(151);
  });

  it('returns an empty array when the offset is past the last order', async () => {
    const res = await request(app).get('/orders?offset=200');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns 400 for a limit that is not a whole number', async () => {
    const res = await request(app).get('/orders?limit=abc');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 for a fractional limit', async () => {
    const res = await request(app).get('/orders?limit=1.5');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 for a limit above the maximum', async () => {
    const res = await request(app).get('/orders?limit=201');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 for a limit below the minimum', async () => {
    const res = await request(app).get('/orders?limit=0');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 for an offset that is not a whole number', async () => {
    const res = await request(app).get('/orders?offset=abc');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 for a fractional offset', async () => {
    const res = await request(app).get('/orders?offset=2.5');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('returns 400 for a negative offset', async () => {
    const res = await request(app).get('/orders?offset=-1');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });
});

describe('GET /orders/:id', () => {
  it('returns one order', async () => {
    const res = await request(app).get('/orders/5');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(5);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/orders/9999');
    expect(res.status).toBe(404);
  });
});
