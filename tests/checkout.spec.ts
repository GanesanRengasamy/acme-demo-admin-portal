import { describe, expect, it } from 'vitest';
import { checkoutTotal } from '../server/src/checkout.js';

describe('checkout', () => {
  it('calculates the checkout total', async () => {
    const total = await checkoutTotal([{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }]);
    expect(total).toBe(25);
  });
});
