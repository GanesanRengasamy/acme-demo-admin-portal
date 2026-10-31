import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../server/src/app.js';
import { orders } from '../server/src/orders.js';
import { getAuditEvents, MAX_BULK_REFUND, resetRefunds } from '../server/src/refunds.js';

const app = createApp();
const refundable = orders.filter((o) => o.status === 'paid' || o.status === 'shipped');
const ids = (n: number, from = 0) => refundable.slice(from, from + n).map((o) => o.id);
const post = (body: unknown, agent: string | null = 'agent-7') => {
  const r = request(app).post('/refunds');
  return (agent ? r.set('X-Agent-Id', agent) : r).send(body as object);
};

beforeEach(() => resetRefunds());

describe('POST /refunds', () => {
  it('refunds several orders together and returns the total', async () => {
    const orderIds = ids(3);
    const res = await post({ orderIds, idempotencyKey: 'k1' });
    expect(res.status).toBe(201);
    expect(res.body.refunds.map((r: { orderId: number }) => r.orderId)).toEqual(orderIds);
    const cents = orderIds.reduce((s, id) => s + Math.round(orders.find((o) => o.id === id)!.total * 100), 0);
    expect(res.body.total).toBe(cents / 100);
  });

  it('accepts exactly 50 orders and rejects 51', async () => {
    expect(MAX_BULK_REFUND).toBe(50);
    expect((await post({ orderIds: ids(50), idempotencyKey: 'k50' })).status).toBe(201);
    const res = await post({ orderIds: ids(51), idempotencyKey: 'k51' });
    expect(res.status).toBe(400);
    expect(getAuditEvents()).toHaveLength(50);
  });

  it.each([
    ['empty orderIds', { orderIds: [], idempotencyKey: 'k' }],
    ['missing orderIds', { idempotencyKey: 'k' }],
    ['non-integer id', { orderIds: ['a'], idempotencyKey: 'k' }],
    ['duplicate ids', { orderIds: [ids(1)[0], ids(1)[0]], idempotencyKey: 'k' }],
    ['missing key', { orderIds: ids(1) }],
    ['blank key', { orderIds: ids(1), idempotencyKey: '  ' }],
  ])('returns 400 for %s', async (_n, body) => {
    expect((await post(body)).status).toBe(400);
  });

  it('returns 400 without an X-Agent-Id header', async () => {
    expect((await post({ orderIds: ids(1), idempotencyKey: 'k' }, null)).status).toBe(400);
  });

  it('returns 404 for an unknown order and refunds nothing', async () => {
    const res = await post({ orderIds: [...ids(2), 9999], idempotencyKey: 'k' });
    expect(res.status).toBe(404);
    expect(getAuditEvents()).toHaveLength(0);
  });

  it('returns 422 for pending or cancelled orders and refunds nothing', async () => {
    const bad = orders.find((o) => o.status === 'pending')!.id;
    const res = await post({ orderIds: [...ids(1), bad], idempotencyKey: 'k' });
    expect(res.status).toBe(422);
    expect(getAuditEvents()).toHaveLength(0);
  });

  it('returns 409 for an order that is already refunded', async () => {
    await post({ orderIds: ids(2), idempotencyKey: 'a' });
    const res = await post({ orderIds: ids(2, 1), idempotencyKey: 'b' });
    expect(res.status).toBe(409);
    expect(getAuditEvents()).toHaveLength(2);
  });
});

describe('idempotency', () => {
  it('a retried request returns the same response and refunds once', async () => {
    const body = { orderIds: ids(3), idempotencyKey: 'retry' };
    const first = await post(body);
    const second = await post(body);
    expect(second.status).toBe(first.status);
    expect(second.body).toEqual(first.body);
    expect(getAuditEvents()).toHaveLength(3);
  });

  it('the same key with different orders returns 422', async () => {
    await post({ orderIds: ids(2), idempotencyKey: 'same' });
    const res = await post({ orderIds: ids(2, 5), idempotencyKey: 'same' });
    expect(res.status).toBe(422);
    expect(getAuditEvents()).toHaveLength(2);
  });

  it('two simultaneous requests with one key refund once', async () => {
    const body = { orderIds: ids(2), idempotencyKey: 'race' };
    const [a, b] = await Promise.all([post(body), post(body)]);
    expect([a.status, b.status]).toEqual([201, 201]);
    expect(getAuditEvents()).toHaveLength(2);
  });

  it('a failed request can be retried with the same key after it is fixed', async () => {
    const bad = orders.find((o) => o.status === 'cancelled')!.id;
    expect((await post({ orderIds: [bad], idempotencyKey: 'f' })).status).toBe(422);
    expect((await post({ orderIds: ids(1), idempotencyKey: 'f' })).status).toBe(201);
  });
});

describe('audit events', () => {
  it('writes one event per refund with who, when and the amount', async () => {
    const orderIds = ids(2);
    const before = Date.now();
    await post({ orderIds, idempotencyKey: 'aud' }, 'agent-42');
    const events = getAuditEvents();
    expect(events).toHaveLength(2);
    events.forEach((e, i) => {
      const order = orders.find((o) => o.id === orderIds[i])!;
      expect(e).toMatchObject({ type: 'refund', orderId: order.id, amount: order.total, actor: 'agent-42', idempotencyKey: 'aud' });
      expect(new Date(e.at).getTime()).toBeGreaterThanOrEqual(before);
      expect(new Date(e.at).toISOString()).toBe(e.at);
    });
  });

  it('writes no events for a replay', async () => {
    const body = { orderIds: ids(1), idempotencyKey: 'r' };
    await post(body);
    await post(body);
    expect(getAuditEvents()).toHaveLength(1);
  });
});
