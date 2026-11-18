export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: number;
  customer: string;
  status: OrderStatus;
  total: number;
  orderDate: Date;
}

const CUSTOMERS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries', 'Wayne Enterprises', 'Wonka'];

// Deterministic PRNG (mulberry32) so generated data is stable between renders and tests.
function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateOrders(count = 100_000, seed = 42): Order[] {
  const rand = prng(seed);
  const start = Date.UTC(2023, 0, 1);
  const orders: Order[] = new Array(count);
  for (let i = 0; i < count; i++) {
    orders[i] = {
      id: i + 1,
      customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
      status: ORDER_STATUSES[Math.floor(rand() * ORDER_STATUSES.length)],
      total: Math.round(rand() * 100000) / 100,
      orderDate: new Date(start + Math.floor(rand() * 730) * 86_400_000),
    };
  }
  return orders;
}
