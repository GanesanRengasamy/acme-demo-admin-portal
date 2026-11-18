import { describe, expect, it } from 'vitest';
import { generateOrders } from './generateOrders';

describe('generateOrders', () => {
  it('generates the requested number of unique, deterministic orders', () => {
    const orders = generateOrders(100_000);
    expect(orders).toHaveLength(100_000);
    expect(new Set(orders.map((o) => o.id)).size).toBe(100_000);
    expect(generateOrders(50)).toEqual(generateOrders(50));
  });

  it('covers every status with valid values', () => {
    const orders = generateOrders(1000);
    expect(new Set(orders.map((o) => o.status))).toEqual(new Set(['pending', 'paid', 'shipped', 'cancelled']));
    expect(orders.every((o) => o.total > 0 && o.createdAt instanceof Date)).toBe(true);
  });
});
