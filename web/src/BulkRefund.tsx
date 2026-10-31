import { useEffect, useRef, useState } from 'react';
import { formatMoney, sumCents } from './refundTotal';

export const MAX_BULK_REFUND = 50;

interface Props {
  selected: { id: number; total: number }[];
  agentId: string;
  onDone: () => void;
}

export default function BulkRefund({ selected, agentId, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // One key per attempt: a retry after a failure reuses it, so it can never refund twice.
  const key = useRef<string | null>(null);
  const attemptIds = useRef('');

  const tooMany = selected.length > MAX_BULK_REFUND;
  const total = sumCents(selected);
  const label = `${selected.length} ${selected.length === 1 ? 'order' : 'orders'}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy]);

  async function confirm() {
    const ids = selected.map((o) => o.id);
    const signature = ids.join(',');
    if (!key.current || attemptIds.current !== signature) {
      key.current = crypto.randomUUID();
      attemptIds.current = signature;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Id': agentId },
        body: JSON.stringify({ orderIds: ids, idempotencyKey: key.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      key.current = null;
      setOpen(false);
      setSuccess(`Refunded ${label}, ${formatMoney(data.total)} in total.`);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bulk-refund">
      <button type="button" disabled={selected.length === 0 || tooMany} onClick={() => { setSuccess(null); setError(null); setOpen(true); }}>
        Refund selected{selected.length > 0 ? ` (${selected.length})` : ''}
      </button>
      {tooMany && <p role="alert">You can select up to {MAX_BULK_REFUND} orders at a time.</p>}
      {success && <p role="status">{success}</p>}
      {open && (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="refund-title" className="dialog">
            <h3 id="refund-title">Confirm refund</h3>
            <p>
              You are about to refund {label}. Refund total: <strong>{formatMoney(total)}</strong>
            </p>
            {error && <p role="alert">{error}</p>}
            <div className="dialog-actions">
              <button type="button" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
              <button type="button" onClick={confirm} disabled={busy}>Confirm refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
