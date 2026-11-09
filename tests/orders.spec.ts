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

  it('returns all orders when no status is given', async () => {
    const res = await request(app).get('/orders?status=');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(200);
  });

  it.each(['pending', 'paid', 'shipped', 'cancelled'])('filters orders by status %s', async (status) => {
    const res = await request(app).get(`/orders?status=${status}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: { status: string }) => o.status === status)).toBe(true);
  });

  it('filters the full order list down to the matching subset', async () => {
    const all = await request(app).get('/orders');
    const filtered = await request(app).get('/orders?status=paid');
    expect(filtered.status).toBe(200);
    expect(filtered.body.length).toBeLessThan(all.body.length);

    let sum = 0;
    for (const status of ['pending', 'paid', 'shipped', 'cancelled']) {
      const res = await request(app).get(`/orders?status=${status}`);
      sum += res.body.length;
    }
    expect(sum).toBe(all.body.length);
  });

  it('returns 400 for an unknown status', async () => {
    const res = await request(app).get('/orders?status=refunded');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid status');
  });

  it('returns 400 for a status that differs only in case', async () => {
    const res = await request(app).get('/orders?status=Paid');
    expect(res.status).toBe(400);
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
