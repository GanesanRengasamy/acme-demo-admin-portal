import { describe, expect, it } from 'vitest';
import { generateOrders } from '../web/src/orders/data';
import { buildRows, filterOrders, sortOrders, visibleRange } from '../web/src/orders/table';
import { buildWorkbookXml } from '../web/src/orders/exportExcel';

const orders = generateOrders(100_000);

describe('web orders table logic', () => {
  it('generates 100,000 deterministic orders', () => {
    expect(orders).toHaveLength(100_000);
    expect(generateOrders(10)).toEqual(generateOrders(10));
  });

  it('filters by multiple columns, case-insensitively', () => {
    const r = filterOrders(orders, { status: 'PAID', customer: 'ada' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((o) => o.status === 'paid' && o.customer.toLowerCase().includes('ada'))).toBe(true);
  });

  it('sorts numerically and descending without mutating input', () => {
    const s = sortOrders(orders, { key: 'total', dir: 'desc' });
    for (let i = 1; i < 1000; i++) expect(s[i - 1].total).toBeGreaterThanOrEqual(s[i].total);
    expect(orders[0].id).toBe(1);
  });

  it('groups by status with collapsible groups', () => {
    const small = generateOrders(500);
    const rows = buildRows(small, true);
    const groups = rows.filter((r) => r.type === 'group');
    expect(groups.length).toBe(5);
    expect(rows.length).toBe(500 + 5);
    const collapsed = buildRows(small, true, new Set(['paid']));
    expect(collapsed.length).toBeLessThan(rows.length);
  });

  it('computes a small virtual window', () => {
    const { start, end } = visibleRange(32_000, 560, 32, 100_000);
    expect(end - start).toBeLessThan(40);
    expect(visibleRange(0, 560, 32, 5)).toEqual({ start: 0, end: 5 });
  });

  it('exports an Excel workbook with escaped content', () => {
    const xml = buildWorkbookXml([{ ...orders[0], customer: 'A & <B>' }]);
    expect(xml).toContain('A &amp; &lt;B&gt;');
    expect(xml.match(/<Row>/g)).toHaveLength(2);
  });
});
