// Sums in whole cents so decimal totals do not drift.
export function sumCents(orders: { total: number }[]): number {
  return orders.reduce((sum, o) => sum + Math.round(o.total * 100), 0) / 100;
}

export const formatMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
