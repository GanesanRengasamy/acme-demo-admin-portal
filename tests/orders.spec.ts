import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';

const app = createApp();

describe('GET /orders', () => {
  it('returns default limit of 50 orders without parameters', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(50);
    expect(res.body[0].id).toBe(1);
    expect(res.body[49].id).toBe(50);
    expect(Object.keys(res.body[0]).sort()).toEqual(['createdAt', 'customer', 'email', 'id', 'status', 'total']);
  });

  it('supports custom limit and offset', async () => {
    const res = await request(app).get('/orders?limit=10&offset=20');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(res.body[0].id).toBe(21);
    expect(res.body[9].id).toBe(30);
  });

  it('supports maximum limit of 200', async () => {
    const res = await request(app).get('/orders?limit=200');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(200);
  });

  it('returns HTTP 400 for limit out of range (> 200)', async () => {
    const res = await request(app).get('/orders?limit=201');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });

  it('returns HTTP 400 for limit out of range (< 1)', async () => {
    const res = await request(app).get('/orders?limit=0');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns HTTP 400 for non-numeric limit', async () => {
    const res = await request(app).get('/orders?limit=abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns HTTP 400 for non-integer limit', async () => {
    const res = await request(app).get('/orders?limit=12.5');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns HTTP 400 for negative offset', async () => {
    const res = await request(app).get('/orders?offset=-1');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns HTTP 400 for non-numeric offset', async () => {
    const res = await request(app).get('/orders?offset=foo');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns HTTP 400 for non-integer offset', async () => {
    const res = await request(app).get('/orders?offset=1.5');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
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
