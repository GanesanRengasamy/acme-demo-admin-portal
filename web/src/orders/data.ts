export const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export interface Order {
  id: number;
  customer: string;
  status: (typeof STATUSES)[number];
  items: number;
  total: number;
  createdAt: string;
}

const FIRST = ['Ada', 'Grace', 'Linus', 'Alan', 'Marie', 'Ken', 'Rosa', 'Hedy', 'Carl', 'Nina'];
const LAST = ['Lovelace', 'Hopper', 'Torvalds', 'Turing', 'Curie', 'Thompson', 'Parks', 'Lamarr', 'Sagan', 'Simone'];

// Small deterministic PRNG so generated data is stable between runs.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateOrders(count: number, seed = 42): Order[] {
  const rnd = mulberry32(seed);
  const start = Date.UTC(2024, 0, 1);
  const span = 365 * 24 * 3600 * 1000;
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    orders.push({
      id: i + 1,
      customer: `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`,
      status: STATUSES[Math.floor(rnd() * STATUSES.length)],
      items: 1 + Math.floor(rnd() * 10),
      total: Math.round(rnd() * 99000 + 500) / 100,
      createdAt: new Date(start + Math.floor(rnd() * span)).toISOString().slice(0, 10),
    });
  }
  return orders;
}
