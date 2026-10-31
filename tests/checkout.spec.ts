import { describe, expect, it } from 'vitest';
import { checkoutTotal } from '../server/src/checkout.js';

describe('checkout', () => {
  // Known flaky test: the pricing call is not awaited. The test only waits a
  // fixed 8 ms, so it fails whenever the simulated pricing latency is longer.
  it('calculates the checkout total', async () => {
    let total = 0;
    checkoutTotal([{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }]).then((t) => {
      total = t;
    });
    await new Promise((r) => setTimeout(r, 8));
    expect(total).toBe(25);
  });
});
