import { describe, expect, it } from 'vitest';
import { generateOrders, STATUSES } from '../web/src/generateOrders.js';

describe('generateOrders', () => {
  const orders = generateOrders();
  it('generates 100,000 orders with unique ids', () => {
    expect(orders).toHaveLength(100_000);
    expect(new Set(orders.map((o) => o.id)).size).toBe(100_000);
  });
  it('is deterministic', () => {
    expect(generateOrders(50)).toEqual(generateOrders(50));
  });
  it('uses known statuses, all represented', () => {
    expect(new Set(orders.map((o) => o.status))).toEqual(new Set(STATUSES));
  });
  it('has valid fields', () => {
    for (const o of orders.slice(0, 1000)) {
      expect(o.total).toBeGreaterThan(0);
      expect(o.email).toMatch(/^[^@\s]+@example\.com$/);
      expect(Number.isNaN(o.createdAt.getTime())).toBe(false);
    }
  });
});
