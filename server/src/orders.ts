export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const customers = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Edsger Dijkstra', 'Barbara Liskov', 'Linus Torvalds', 'Margaret Hamilton', 'Dennis Ritchie'];
const statuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];

// Deterministic seed data so tests and screenshots stay stable.
export const orders: Order[] = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const customer = customers[i % customers.length];
  return {
    id,
    customer,
    email: `${customer.toLowerCase().replace(/ /g, '.')}@example.com`,
    total: Math.round((20 + ((id * 37) % 480) + ((id * 13) % 100) / 100) * 100) / 100,
    status: statuses[(id * 7) % statuses.length],
    createdAt: new Date(Date.UTC(2024, 0, 1) + id * 86_400_000).toISOString(),
  };
});
