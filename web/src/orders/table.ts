import type { Order } from './data';

export type ColumnKey = keyof Order;
export interface Column {
  key: ColumnKey;
  label: string;
  numeric?: boolean;
}
export const COLUMNS: Column[] = [
  { key: 'id', label: 'Order #', numeric: true },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'items', label: 'Items', numeric: true },
  { key: 'total', label: 'Total', numeric: true },
  { key: 'createdAt', label: 'Created' },
];

export type Filters = Partial<Record<ColumnKey, string>>;
export interface Sort {
  key: ColumnKey;
  dir: 'asc' | 'desc';
}

export function filterOrders(orders: Order[], filters: Filters): Order[] {
  const active = Object.entries(filters)
    .map(([k, v]) => [k as ColumnKey, (v ?? '').trim().toLowerCase()] as const)
    .filter(([, v]) => v !== '');
  if (!active.length) return orders;
  return orders.filter((o) => active.every(([k, v]) => String(o[k]).toLowerCase().includes(v)));
}

export function sortOrders(orders: Order[], sort: Sort | null): Order[] {
  if (!sort) return orders;
  const { key, dir } = sort;
  const m = dir === 'asc' ? 1 : -1;
  return [...orders].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
    return c * m || a.id - b.id;
  });
}

export type Row =
  | { type: 'group'; status: string; count: number; collapsed: boolean }
  | { type: 'order'; order: Order };

/** Flattens orders into display rows, optionally grouped by status with collapsible groups. */
export function buildRows(orders: Order[], groupByStatus: boolean, collapsed: ReadonlySet<string> = new Set()): Row[] {
  if (!groupByStatus) return orders.map((order) => ({ type: 'order', order }));
  const groups = new Map<string, Order[]>();
  for (const o of orders) {
    const g = groups.get(o.status);
    if (g) g.push(o);
    else groups.set(o.status, [o]);
  }
  const rows: Row[] = [];
  for (const status of [...groups.keys()].sort()) {
    const list = groups.get(status)!;
    const isCollapsed = collapsed.has(status);
    rows.push({ type: 'group', status, count: list.length, collapsed: isCollapsed });
    if (!isCollapsed) for (const order of list) rows.push({ type: 'order', order });
  }
  return rows;
}

/** Computes the window of rows to render for a virtualized list. */
export function visibleRange(scrollTop: number, viewportHeight: number, rowHeight: number, total: number, overscan = 8) {
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
  return { start, end };
}
