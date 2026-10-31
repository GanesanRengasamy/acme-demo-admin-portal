export interface CartItem {
  price: number;
  quantity: number;
}

// Simulates a call to a pricing service with variable latency.
export async function getPrice(item: CartItem): Promise<number> {
  await new Promise((r) => setTimeout(r, Math.random() * 12));
  return item.price * item.quantity;
}

export async function checkoutTotal(items: CartItem[]): Promise<number> {
  const prices = await Promise.all(items.map(getPrice));
  return prices.reduce((sum, p) => sum + p, 0);
}
