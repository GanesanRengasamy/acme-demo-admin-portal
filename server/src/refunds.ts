import { randomUUID } from 'node:crypto';
import { orders } from './orders.js';

export const MAX_BULK_REFUND = 50;
const REFUNDABLE = new Set(['paid', 'shipped']);

export interface AuditEvent {
  id: string;
  type: 'refund';
  orderId: number;
  amount: number;
  actor: string;
  at: string;
  idempotencyKey: string;
}

export interface RefundResult {
  status: number;
  body: Record<string, unknown>;
}

interface StoredResponse extends RefundResult {
  orderIds: number[];
}

// In-memory stores; they reset on restart. See the pull request notes.
const refundedOrders = new Set<number>();
const responses = new Map<string, StoredResponse>();
const auditEvents: AuditEvent[] = [];

export const getAuditEvents = (): readonly AuditEvent[] => auditEvents;

export function resetRefunds(): void {
  refundedOrders.clear();
  responses.clear();
  auditEvents.length = 0;
}

const fail = (status: number, error: string): RefundResult => ({ status, body: { error } });

// Fully synchronous on purpose: no await between checking the key and storing
// the result, so two simultaneous requests with one key cannot both refund.
export function createRefunds(input: { orderIds: unknown; idempotencyKey: unknown; actor: string | undefined }): RefundResult {
  const { orderIds, idempotencyKey, actor } = input;
  if (!actor?.trim()) return fail(400, 'X-Agent-Id header is required');
  if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) return fail(400, 'idempotencyKey is required');
  if (!Array.isArray(orderIds) || orderIds.length === 0) return fail(400, 'orderIds must be a non-empty array');
  if (orderIds.length > MAX_BULK_REFUND) return fail(400, `At most ${MAX_BULK_REFUND} orders can be refunded at once`);
  if (!orderIds.every((id) => Number.isInteger(id))) return fail(400, 'orderIds must be integers');
  if (new Set(orderIds).size !== orderIds.length) return fail(400, 'orderIds must not contain duplicates');
  const ids = orderIds as number[];

  const stored = responses.get(idempotencyKey);
  if (stored) {
    if (stored.orderIds.length !== ids.length || stored.orderIds.some((id, i) => id !== ids[i])) {
      return fail(422, 'idempotencyKey was already used with different orders');
    }
    return { status: stored.status, body: stored.body };
  }

  const found = ids.map((id) => orders.find((o) => o.id === id));
  if (found.some((o) => !o)) return fail(404, 'Order not found');
  const selected = found as NonNullable<(typeof found)[number]>[];
  if (selected.some((o) => refundedOrders.has(o.id))) return fail(409, 'Order already refunded');
  if (selected.some((o) => !REFUNDABLE.has(o.status))) return fail(422, 'Only paid or shipped orders can be refunded');

  const at = new Date().toISOString();
  const refunds = selected.map((o) => ({ orderId: o.id, amount: o.total }));
  for (const o of selected) {
    refundedOrders.add(o.id);
    auditEvents.push({ id: randomUUID(), type: 'refund', orderId: o.id, amount: o.total, actor: actor.trim(), at, idempotencyKey });
  }
  const totalCents = selected.reduce((sum, o) => sum + Math.round(o.total * 100), 0);
  const result = { status: 201, body: { refunds, total: totalCents / 100 } };
  responses.set(idempotencyKey, { ...result, orderIds: ids });
  return result;
}
