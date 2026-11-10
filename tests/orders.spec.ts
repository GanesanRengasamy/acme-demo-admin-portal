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
});

describe('GET /orders?status=...', () => {
  it.each(['pending', 'paid', 'shipped', 'cancelled'] as const)(
    'filters orders by status=%s',
    async (status) => {
      const res = await request(app).get(`/orders?status=${status}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.length).toBeLessThan(200);
      for (const order of res.body) {
        expect(order.status).toBe(status);
      }
    },
  );

  it('returns 400 for an unknown status', async () => {
    const res = await request(app).get('/orders?status=banana');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: expect.stringContaining('banana') });
  });

  it('returns 400 for an empty status', async () => {
    const res = await request(app).get('/orders?status=');
    expect(res.status).toBe(400);
  });

  it('returns 400 when multiple status query parameters are provided', async () => {
    const res = await request(app).get('/orders?status=pending&status=paid');
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
