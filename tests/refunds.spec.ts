import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../server/src/app.js';
import { orders } from '../server/src/orders.js';
import { createRefundService } from '../server/src/refunds.js';

const refundable = orders.filter((o) => o.status === 'paid' || o.status === 'shipped');
const ids = (n: number, from = 0) => refundable.slice(from, from + n).map((o) => o.id);

let service: ReturnType<typeof createRefundService>;
let app: ReturnType<typeof createApp>;
let n = 0;
const key = () => `key-${++n}`;
const post = (body: unknown, agent: string | null = 'agent-1') => {
  const r = request(app).post('/refunds');
  if (agent) r.set('X-Agent-Id', agent);
  return r.send(body as object);
};

beforeEach(() => {
  service = createRefundService(orders);
  app = createApp(service);
});
afterEach(() => vi.useRealTimers());

describe('POST /refunds - bulk', () => {
  it('refunds 50 orders and returns the total', async () => {
    const list = ids(50);
    const res = await post({ orderIds: list, idempotencyKey: key() });
    expect(res.status).toBe(200);
    expect(res.body.refunds).toHaveLength(50);
    const cents = list.reduce((s, id) => s + Math.round(orders.find((o) => o.id === id)!.total * 100), 0);
    expect(res.body.total).toBe(cents / 100);
  });

  it('rejects 51 orders', async () => {
    const res = await post({ orderIds: ids(51), idempotencyKey: key() });
    expect(res.status).toBe(400);
    expect(service.auditEvents()).toHaveLength(0);
  });

  it.each([
    ['empty', []],
    ['duplicates', [refundable[0].id, refundable[0].id]],
    ['non-integers', [1.5]],
    ['not an array', 'x'],
  ])('rejects %s', async (_name, orderIds) => {
    const res = await post({ orderIds, idempotencyKey: key() });
    expect(res.status).toBe(400);
  });

  it('rejects unknown orders and refunds nothing', async () => {
    const res = await post({ orderIds: [refundable[0].id, 9999], idempotencyKey: key() });
    expect(res.status).toBe(422);
    expect(res.body.orderIds).toEqual([9999]);
    expect(service.auditEvents()).toHaveLength(0);
  });

  it('rejects pending and cancelled orders', async () => {
    const bad = orders.find((o) => o.status === 'pending' || o.status === 'cancelled')!;
    const res = await post({ orderIds: [refundable[0].id, bad.id], idempotencyKey: key() });
    expect(res.status).toBe(422);
    expect(res.body.orderIds).toEqual([bad.id]);
  });

  it('rejects an order that was already refunded under another key', async () => {
    await post({ orderIds: ids(2), idempotencyKey: key() });
    const res = await post({ orderIds: ids(1), idempotencyKey: key() });
    expect(res.status).toBe(422);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app).post('/refunds').set('X-Agent-Id', 'a').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });
});

describe('POST /refunds - idempotency', () => {
  it('returns the same body on retry and does not refund or audit again', async () => {
    const k = key();
    const body = { orderIds: ids(3), idempotencyKey: k };
    const first = await post(body);
    const second = await post(body);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(second.headers['idempotent-replay']).toBe('true');
    expect(service.auditEvents()).toHaveLength(3);
  });

  it('treats a reordered id list as the same request', async () => {
    const k = key();
    const list = ids(3);
    const first = await post({ orderIds: list, idempotencyKey: k });
    const second = await post({ orderIds: [...list].reverse(), idempotencyKey: k });
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(service.auditEvents()).toHaveLength(3);
  });

  it('returns 409 when a key is reused with different orders', async () => {
    const k = key();
    await post({ orderIds: ids(2), idempotencyKey: k });
    const res = await post({ orderIds: ids(2, 2), idempotencyKey: k });
    expect(res.status).toBe(409);
    expect(service.auditEvents()).toHaveLength(2);
  });

  it('refunds once for concurrent requests with the same key', async () => {
    const body = { orderIds: ids(5), idempotencyKey: key() };
    const results = await Promise.all([post(body), post(body), post(body)]);
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(service.auditEvents()).toHaveLength(5);
  });

  it('does not consume the key when validation fails', async () => {
    const k = key();
    const bad = await post({ orderIds: [9999], idempotencyKey: k });
    expect(bad.status).toBe(422);
    const ok = await post({ orderIds: ids(1), idempotencyKey: k });
    expect(ok.status).toBe(200);
  });

  it.each([[undefined], [''], ['x'.repeat(129)], [42]])('rejects invalid key %s', async (k) => {
    const res = await post({ orderIds: ids(1), idempotencyKey: k });
    expect(res.status).toBe(400);
  });
});

describe('POST /refunds - audit', () => {
  it('writes one event per order with who, when and amount', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-03-04T05:06:07.000Z'));
    const list = ids(3);
    const k = key();
    await post({ orderIds: list, idempotencyKey: k }, 'agent-42');
    const events = service.auditEvents();
    expect(events).toHaveLength(3);
    events.forEach((e, i) => {
      expect(e).toMatchObject({
        type: 'refund.created',
        actor: 'agent-42',
        at: '2025-03-04T05:06:07.000Z',
        orderId: list[i],
        amount: orders.find((o) => o.id === list[i])!.total,
        idempotencyKey: k,
      });
    });
  });

  it('rejects requests without an agent and writes no events', async () => {
    const res = await post({ orderIds: ids(1), idempotencyKey: key() }, null);
    expect(res.status).toBe(400);
    expect(service.auditEvents()).toHaveLength(0);
  });
});
