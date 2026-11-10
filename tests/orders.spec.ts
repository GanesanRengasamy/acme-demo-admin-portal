import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';

const app = createApp();

describe('GET /orders', () => {
  it('returns default limit of 50 orders when no pagination params are provided', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(50);
    expect(res.body[0].id).toBe(1);
    expect(res.body[49].id).toBe(50);
    expect(Object.keys(res.body[0]).sort()).toEqual(['createdAt', 'customer', 'email', 'id', 'status', 'total']);
  });

  it('supports custom limit and offset query parameters', async () => {
    const res = await request(app).get('/orders?limit=10&offset=20');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(res.body[0].id).toBe(21);
    expect(res.body[9].id).toBe(30);
  });

  it('supports maximum limit of 200 orders', async () => {
    const res = await request(app).get('/orders?limit=200');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(200);
    expect(res.body[0].id).toBe(1);
    expect(res.body[199].id).toBe(200);
  });

  it('returns an empty array when offset exceeds total orders', async () => {
    const res = await request(app).get('/orders?offset=300');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 400 when limit is not a whole number', async () => {
    const res = await request(app).get('/orders?limit=abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');

    const floatRes = await request(app).get('/orders?limit=10.5');
    expect(floatRes.status).toBe(400);
    expect(floatRes.body).toHaveProperty('error');
  });

  it('returns 400 when limit is out of range', async () => {
    const zeroRes = await request(app).get('/orders?limit=0');
    expect(zeroRes.status).toBe(400);
    expect(zeroRes.body).toHaveProperty('error');

    const negRes = await request(app).get('/orders?limit=-5');
    expect(negRes.status).toBe(400);
    expect(negRes.body).toHaveProperty('error');

    const overRes = await request(app).get('/orders?limit=201');
    expect(overRes.status).toBe(400);
    expect(overRes.body).toHaveProperty('error');
  });

  it('returns 400 when offset is not a whole number', async () => {
    const res = await request(app).get('/orders?offset=xyz');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');

    const floatRes = await request(app).get('/orders?offset=2.5');
    expect(floatRes.status).toBe(400);
    expect(floatRes.body).toHaveProperty('error');
  });

  it('returns 400 when offset is out of range', async () => {
    const res = await request(app).get('/orders?offset=-1');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
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
