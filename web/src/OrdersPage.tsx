import { ColumnDirective, ColumnsDirective, Filter, GridComponent, Inject, Page, Selection, Sort } from '@syncfusion/ej2-react-grids';
import { useCallback, useEffect, useRef, useState } from 'react';
import RefundDialog from './RefundDialog';
import { MAX_REFUND_BATCH, isRefundable } from './refundSelection';

interface Order {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

// No real authentication exists yet; the server records this value as the actor.
const AGENT_ID = import.meta.env.VITE_AGENT_ID || 'unknown-agent';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundedIds, setRefundedIds] = useState<Set<number>>(new Set());
  const gridRef = useRef<GridComponent>(null);
  const idempotencyKey = useRef('');

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Order[]) => setOrders(data.map((o) => ({ ...o, createdAt: new Date(o.createdAt) as unknown as string }))))
      .catch((e: Error) => setError(e.message));
  }, []);

  const syncSelection = useCallback(() => {
    setSelected((gridRef.current?.getSelectedRecords() as Order[] | undefined) ?? []);
  }, []);

  const onRowSelecting = (args: { data?: Order | Order[]; cancel?: boolean }) => {
    const incoming = Array.isArray(args.data) ? args.data : args.data ? [args.data] : [];
    const current = (gridRef.current?.getSelectedRecords() as Order[] | undefined) ?? [];
    const newOnes = incoming.filter((o) => !current.some((c) => c.id === o.id));
    if (newOnes.some((o) => !isRefundable(o) || refundedIds.has(o.id))) {
      args.cancel = true;
      setNotice('Only paid or shipped orders that have not been refunded can be selected.');
    } else if (current.length + newOnes.length > MAX_REFUND_BATCH) {
      args.cancel = true;
      setNotice(`You can refund at most ${MAX_REFUND_BATCH} orders at once.`);
    } else {
      setNotice(null);
    }
  };

  const openDialog = () => {
    idempotencyKey.current = crypto.randomUUID();
    setRefundError(null);
    setConfirming(true);
  };

  const confirm = async () => {
    setSubmitting(true);
    setRefundError(null);
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Id': AGENT_ID },
        body: JSON.stringify({ orderIds: selected.map((o) => o.id), idempotencyKey: idempotencyKey.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const ids = Array.isArray(data.orderIds) ? ` (orders: ${data.orderIds.join(', ')})` : '';
        throw new Error(`${data.error ?? `HTTP ${res.status}`}${ids}`);
      }
      setRefundedIds((prev) => new Set([...prev, ...selected.map((o) => o.id)]));
      gridRef.current?.clearSelection();
      setSelected([]);
      setConfirming(false);
      setNotice(`Refunded ${data.refunds.length} orders.`);
    } catch (e) {
      // The same idempotency key is kept so retrying the dialog cannot refund twice.
      setRefundError(`Refund failed: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Orders</h2>
      {error && <p role="alert">Could not load orders: {error}</p>}
      <div className="toolbar">
        <button type="button" onClick={openDialog} disabled={selected.length === 0}>
          Refund {selected.length} selected
        </button>
        <span> {selected.length}/{MAX_REFUND_BATCH} selected</span>
      </div>
      {notice && <p role="status">{notice}</p>}
      <GridComponent
        ref={gridRef}
        dataSource={orders}
        allowPaging
        allowSorting
        allowFiltering
        pageSettings={{ pageSize: 15 }}
        filterSettings={{ type: 'Menu' }}
        selectionSettings={{ type: 'Multiple', checkboxOnly: true, persistSelection: true }}
        rowSelecting={onRowSelecting}
        rowSelected={syncSelection}
        rowDeselected={syncSelection}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="id" headerText="ID" width="80" textAlign="Right" isPrimaryKey />
          <ColumnDirective field="customer" headerText="Customer" width="160" />
          <ColumnDirective field="email" headerText="Email" width="240" />
          <ColumnDirective field="total" headerText="Total" width="110" format="C2" type="number" textAlign="Right" />
          <ColumnDirective field="status" headerText="Status" width="120" />
          <ColumnDirective field="createdAt" headerText="Created" width="140" type="date" format="yMd" />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Selection]} />
      </GridComponent>
      {confirming && (
        <RefundDialog orders={selected} submitting={submitting} error={refundError} onConfirm={confirm} onCancel={() => setConfirming(false)} />
      )}
    </section>
  );
}
