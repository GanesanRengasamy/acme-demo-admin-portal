import { formatMoney, selectionTotal } from './refundSelection';

interface Props {
  orders: { id: number; total: number }[];
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RefundDialog({ orders, submitting, error, onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-backdrop">
      <div role="dialog" aria-modal="true" aria-labelledby="refund-title" className="dialog">
        <h3 id="refund-title">Confirm refund</h3>
        <p>
          Refund {orders.length} {orders.length === 1 ? 'order' : 'orders'}?
        </p>
        <p>
          Refund total: <strong data-testid="refund-total">{formatMoney(selectionTotal(orders))}</strong>
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" onClick={onCancel} disabled={submitting} autoFocus>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Refunding…' : 'Confirm refund'}
          </button>
        </div>
      </div>
    </div>
  );
}
