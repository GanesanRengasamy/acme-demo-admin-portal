export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface OrderRow {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

const customers = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Edsger Dijkstra', 'Barbara Liskov', 'Linus Torvalds', 'Margaret Hamilton', 'Dennis Ritchie'];
const statuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];
const DAY_MS = 86_400_000;

// Deterministic so the table is stable between renders and in tests.
export function generateOrders(count: number): OrderRow[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const customer = customers[i % customers.length];
    return {
      id,
      customer,
      email: `${customer.toLowerCase().replace(/ /g, '.')}@example.com`,
      total: Math.round((20 + ((id * 37) % 480) + ((id * 13) % 100) / 100) * 100) / 100,
      status: statuses[(id * 7) % statuses.length],
      createdAt: new Date(Date.UTC(2024, 0, 1) + (id % 1000) * DAY_MS),
    };
  });
}
