export interface GeneratedOrder {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: Date;
}

export const STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'] as const;
const FIRST = ['Ava', 'Ben', 'Chloe', 'Dan', 'Eve', 'Finn', 'Gina', 'Hugo', 'Iris', 'Jack'];
const LAST = ['Smith', 'Jones', 'Lee', 'Khan', 'Garcia', 'Brown', 'Novak', 'Rossi', 'Kim', 'Tanaka'];

export function generateOrders(count = 100_000): GeneratedOrder[] {
  const base = Date.UTC(2024, 0, 1);
  const orders: GeneratedOrder[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const first = FIRST[i % FIRST.length];
    const last = LAST[Math.floor(i / FIRST.length) % LAST.length];
    orders[i] = {
      id,
      customer: `${first} ${last}`,
      email: `${first}.${last}${id}@example.com`.toLowerCase(),
      total: Math.round(((id * 7919) % 100000)) / 100 + 5,
      status: STATUSES[(id * 31) % STATUSES.length],
      createdAt: new Date(base + ((id * 104729) % (365 * 86400)) * 1000),
    };
  }
  return orders;
}
