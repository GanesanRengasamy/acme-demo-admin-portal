import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';

const app = createApp();

describe('GET /orders', () => {
  it('returns the 200 seeded orders', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(200);
    expect(Object.keys(res.body[0]).sort()).toEqual(['createdAt', 'customer', 'email', 'id', 'status', 'total']);
  });

  it.each(['pending', 'paid', 'shipped', 'cancelled'])('filters orders by valid status: %s', async (status) => {
    const res = await request(app).get(`/orders?status=${status}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((order: { status: string }) => order.status === status)).toBe(true);
  });

  it('returns 400 for unknown status value', async () => {
    const res = await request(app).get('/orders?status=invalid_status');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid status' });
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
