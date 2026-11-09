import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';

const app = createApp();

describe('GET /orders', () => {
  it('returns default limit of 50 orders starting at offset 0', async () => {
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

  it('supports maximum limit of 200', async () => {
    const res = await request(app).get('/orders?limit=200');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(200);
    expect(res.body[0].id).toBe(1);
    expect(res.body[199].id).toBe(200);
  });

  it('returns 400 when limit is not a whole number', async () => {
    const res1 = await request(app).get('/orders?limit=abc');
    expect(res1.status).toBe(400);
    expect(res1.body).toEqual({ error: expect.any(String) });

    const res2 = await request(app).get('/orders?limit=12.5');
    expect(res2.status).toBe(400);
    expect(res2.body).toEqual({ error: expect.any(String) });

    const res3 = await request(app).get('/orders?limit=-5');
    expect(res3.status).toBe(400);
    expect(res3.body).toEqual({ error: expect.any(String) });
  });

  it('returns 400 when limit is out of range', async () => {
    const res1 = await request(app).get('/orders?limit=0');
    expect(res1.status).toBe(400);
    expect(res1.body).toEqual({ error: expect.any(String) });

    const res2 = await request(app).get('/orders?limit=201');
    expect(res2.status).toBe(400);
    expect(res2.body).toEqual({ error: expect.any(String) });
  });

  it('returns 400 when offset is not a whole number', async () => {
    const res1 = await request(app).get('/orders?offset=foo');
    expect(res1.status).toBe(400);
    expect(res1.body).toEqual({ error: expect.any(String) });

    const res2 = await request(app).get('/orders?offset=3.14');
    expect(res2.status).toBe(400);
    expect(res2.body).toEqual({ error: expect.any(String) });

    const res3 = await request(app).get('/orders?offset=-1');
    expect(res3.status).toBe(400);
    expect(res3.body).toEqual({ error: expect.any(String) });
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
