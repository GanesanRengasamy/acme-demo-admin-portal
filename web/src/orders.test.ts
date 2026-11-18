import { describe, expect, it } from 'vitest';
import { generateOrders, ORDER_STATUSES } from './orders';

describe('generateOrders', () => {
  it('generates the requested number of orders with unique ids', () => {
    const orders = generateOrders(100_000);
    expect(orders).toHaveLength(100_000);
    expect(new Set(orders.map((o) => o.id)).size).toBe(100_000);
  });

  it('is deterministic', () => {
    expect(generateOrders(50)).toEqual(generateOrders(50));
  });

  it('uses valid statuses and totals, covering every status', () => {
    const orders = generateOrders(1000);
    expect(new Set(orders.map((o) => o.status))).toEqual(new Set(ORDER_STATUSES));
    expect(orders.every((o) => o.total >= 0 && o.orderDate instanceof Date)).toBe(true);
  });
});
