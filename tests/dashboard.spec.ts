import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';
import { deliveriesFromOrders, revenueByMonth, type Order } from '../web/src/dashboard.js';

const o = (id: number, total: number, status: string, createdAt: string): Order => ({ id, customer: 'C', email: 'c@x.com', total, status, createdAt });

describe('revenueByMonth', () => {
  it('sums per month, sorted, excluding cancelled', () => {
    const result = revenueByMonth([
      o(1, 10.1, 'paid', '2024-02-05T00:00:00.000Z'),
      o(2, 20.2, 'pending', '2024-01-31T00:00:00.000Z'),
      o(3, 5, 'cancelled', '2024-01-10T00:00:00.000Z'),
      o(4, 0.2, 'shipped', '2024-02-20T00:00:00.000Z'),
    ]);
    expect(result).toEqual([
      { month: '2024-01', revenue: 20.2 },
      { month: '2024-02', revenue: 10.3 },
    ]);
  });

  it('returns nothing for no orders', () => expect(revenueByMonth([])).toEqual([]));

  it('matches the seeded API data total', async () => {
    const { body } = await request(createApp()).get('/orders');
    const sum = revenueByMonth(body).reduce((s, m) => s + m.revenue, 0);
    const expected = (body as Order[]).filter((x) => x.status !== 'cancelled').reduce((s, x) => s + x.total, 0);
    expect(sum).toBeCloseTo(expected, 2);
  });
});

describe('deliveriesFromOrders', () => {
  it('schedules only paid/shipped orders, 3 days out, one hour long', () => {
    const d = deliveriesFromOrders([
      o(1, 1, 'paid', '2024-01-02T00:00:00.000Z'),
      o(2, 1, 'pending', '2024-01-02T00:00:00.000Z'),
      o(3, 1, 'cancelled', '2024-01-02T00:00:00.000Z'),
      o(4, 1, 'shipped', '2024-01-02T00:00:00.000Z'),
    ]);
    expect(d.map((x) => x.Id)).toEqual([1, 4]);
    expect(d[0].StartTime.toISOString()).toBe('2024-01-05T10:00:00.000Z');
    expect(d[0].EndTime.getTime() - d[0].StartTime.getTime()).toBe(3_600_000);
  });
});
