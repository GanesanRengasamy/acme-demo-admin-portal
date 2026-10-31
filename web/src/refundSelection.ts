export const MAX_REFUND_BATCH = 50;

export interface RefundableOrder {
  id: number;
  total: number;
  status: string;
}

export function isRefundable(order: RefundableOrder): boolean {
  return order.status === 'paid' || order.status === 'shipped';
}

export function canSelectMore(selectedCount: number): boolean {
  return selectedCount < MAX_REFUND_BATCH;
}

// Sums in integer cents so 0.1 + 0.2 is exactly 0.3.
export function selectionTotal(orders: { total: number }[]): number {
  return orders.reduce((sum, o) => sum + Math.round(o.total * 100), 0) / 100;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
