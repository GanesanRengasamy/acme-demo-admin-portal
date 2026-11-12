export interface Order {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface MonthRevenue {
  month: string;
  revenue: number;
}

export interface Delivery {
  Id: number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
}

const DAY_MS = 86_400_000;
const DELIVERY_LEAD_DAYS = 3;

/** Revenue per UTC month, excluding cancelled orders, in chronological order. */
export function revenueByMonth(orders: Order[]): MonthRevenue[] {
  const totals = new Map<string, number>();
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    const key = o.createdAt.slice(0, 7);
    totals.set(key, (totals.get(key) ?? 0) + o.total);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));
}

/** Paid and shipped orders are scheduled for a one-hour delivery slot 3 days after creation. */
export function deliveriesFromOrders(orders: Order[]): Delivery[] {
  return orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .map((o) => {
      const start = new Date(new Date(o.createdAt).getTime() + DELIVERY_LEAD_DAYS * DAY_MS);
      start.setUTCHours(9 + (o.id % 8), 0, 0, 0);
      return { Id: o.id, Subject: `#${o.id} ${o.customer}`, StartTime: start, EndTime: new Date(start.getTime() + 3_600_000) };
    });
}
