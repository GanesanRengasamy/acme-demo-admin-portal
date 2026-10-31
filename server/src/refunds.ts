import { randomUUID } from 'node:crypto';
import type { Order } from './orders.js';

export const MAX_REFUND_BATCH = 50;
const MAX_KEY_LENGTH = 128;
const REFUNDABLE_STATUSES = ['paid', 'shipped'];

export interface AuditEvent {
  id: string;
  type: 'refund.created';
  actor: string;
  at: string;
  orderId: number;
  amount: number;
  idempotencyKey: string;
}

export interface RefundResponse {
  refunds: { orderId: number; amount: number }[];
  total: number;
  refundedAt: string;
}

export type RefundResult =
  | { ok: true; status: 200; body: RefundResponse; replay: boolean }
  | { ok: false; status: 400 | 409 | 422; error: string; orderIds?: number[] };

const toCents = (amount: number) => Math.round(amount * 100);

// State is in memory and is lost on restart. Idempotency keys never expire.
export function createRefundService(orders: Order[]) {
  const refunded = new Set<number>();
  const audit: AuditEvent[] = [];
  const keys = new Map<string, { fingerprint: string; body: RefundResponse }>();

  // Fully synchronous: no await between the key check and the writes, so two
  // concurrent requests with the same key cannot both refund.
  function refund(input: { orderIds: unknown; idempotencyKey: unknown; actor: string | undefined }): RefundResult {
    const { orderIds, idempotencyKey, actor } = input;
    if (!actor) return { ok: false, status: 400, error: 'X-Agent-Id header is required' };
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0 || idempotencyKey.length > MAX_KEY_LENGTH) {
      return { ok: false, status: 400, error: `idempotencyKey must be a string of 1-${MAX_KEY_LENGTH} characters` };
    }
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return { ok: false, status: 400, error: 'orderIds must be a non-empty array' };
    }
    if (orderIds.length > MAX_REFUND_BATCH) {
      return { ok: false, status: 400, error: `At most ${MAX_REFUND_BATCH} orders can be refunded at once` };
    }
    if (!orderIds.every((id) => Number.isInteger(id) && id > 0)) {
      return { ok: false, status: 400, error: 'orderIds must be positive integers' };
    }
    const ids = orderIds as number[];
    if (new Set(ids).size !== ids.length) {
      return { ok: false, status: 400, error: 'orderIds must not contain duplicates' };
    }

    const fingerprint = [...ids].sort((a, b) => a - b).join(',');
    const previous = keys.get(idempotencyKey);
    if (previous) {
      if (previous.fingerprint !== fingerprint) {
        return { ok: false, status: 409, error: 'idempotencyKey was already used with different orders' };
      }
      return { ok: true, status: 200, body: previous.body, replay: true };
    }

    const found = ids.map((id) => orders.find((o) => o.id === id));
    const unknown = ids.filter((_, i) => !found[i]);
    if (unknown.length > 0) return { ok: false, status: 422, error: 'Unknown orders', orderIds: unknown };
    const rows = found as Order[];
    const notRefundable = rows.filter((o) => !REFUNDABLE_STATUSES.includes(o.status) || refunded.has(o.id));
    if (notRefundable.length > 0) {
      return { ok: false, status: 422, error: 'Orders are not refundable', orderIds: notRefundable.map((o) => o.id) };
    }

    const at = new Date().toISOString();
    for (const o of rows) {
      refunded.add(o.id);
      audit.push({ id: randomUUID(), type: 'refund.created', actor, at, orderId: o.id, amount: o.total, idempotencyKey });
    }
    const body: RefundResponse = {
      refunds: rows.map((o) => ({ orderId: o.id, amount: o.total })),
      total: rows.reduce((sum, o) => sum + toCents(o.total), 0) / 100,
      refundedAt: at,
    };
    keys.set(idempotencyKey, { fingerprint, body });
    return { ok: true, status: 200, body, replay: false };
  }

  return { refund, auditEvents: () => [...audit] };
}

export type RefundService = ReturnType<typeof createRefundService>;
