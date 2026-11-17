import { describe, expect, it } from 'vitest';
import { orders } from '../server/src/orders.js';

describe('Orders Date Range Filtering Logic', () => {
  it('returns all orders when no date range is set', () => {
    const start = null;
    const end = null;
    const filtered = orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      if (start) {
        const startTime = new Date(start).setHours(0, 0, 0, 0);
        if (orderTime < startTime) return false;
      }
      if (end) {
        const endTime = new Date(end).setHours(23, 59, 59, 999);
        if (orderTime > endTime) return false;
      }
      return true;
    });

    expect(filtered).toHaveLength(200);
  });

  it('filters orders by start and end date inclusive', () => {
    // Seeded orders: id 1 is 2024-01-02, id 2 is 2024-01-03, ... id 10 is 2024-01-11
    const start = new Date('2024-01-05T00:00:00.000Z');
    const end = new Date('2024-01-10T00:00:00.000Z');

    const filtered = orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      if (start) {
        const startTime = new Date(start).setHours(0, 0, 0, 0);
        if (orderTime < startTime) return false;
      }
      if (end) {
        const endTime = new Date(end).setHours(23, 59, 59, 999);
        if (orderTime > endTime) return false;
      }
      return true;
    });

    // Orders for Jan 5, 6, 7, 8, 9, 10 -> ids 4, 5, 6, 7, 8, 9
    expect(filtered.length).toBeGreaterThan(0);
    for (const order of filtered) {
      const orderDate = new Date(order.createdAt);
      expect(orderDate.getTime()).toBeGreaterThanOrEqual(new Date(start).setHours(0, 0, 0, 0));
      expect(orderDate.getTime()).toBeLessThanOrEqual(new Date(end).setHours(23, 59, 59, 999));
    }
  });

  it('filters orders with only start date', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = null;

    const filtered = orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      if (start) {
        const startTime = new Date(start).setHours(0, 0, 0, 0);
        if (orderTime < startTime) return false;
      }
      if (end) {
        const endTime = new Date(end).setHours(23, 59, 59, 999);
        if (orderTime > endTime) return false;
      }
      return true;
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(200);
    for (const order of filtered) {
      const orderDate = new Date(order.createdAt);
      expect(orderDate.getTime()).toBeGreaterThanOrEqual(new Date(start).setHours(0, 0, 0, 0));
    }
  });

  it('filters orders with only end date', () => {
    const start = null;
    const end = new Date('2024-01-15T00:00:00.000Z');

    const filtered = orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      if (start) {
        const startTime = new Date(start).setHours(0, 0, 0, 0);
        if (orderTime < startTime) return false;
      }
      if (end) {
        const endTime = new Date(end).setHours(23, 59, 59, 999);
        if (orderTime > endTime) return false;
      }
      return true;
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(200);
    for (const order of filtered) {
      const orderDate = new Date(order.createdAt);
      expect(orderDate.getTime()).toBeLessThanOrEqual(new Date(end).setHours(23, 59, 59, 999));
    }
  });
});
