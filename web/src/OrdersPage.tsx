import { ColumnDirective, ColumnsDirective, Filter, GridComponent, Inject, Page, Sort } from '@syncfusion/ej2-react-grids';
import { useCallback, useEffect, useRef, useState } from 'react';
import BulkRefund from './BulkRefund';

interface Order {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Map<number, Order>>(new Map());
  const [agentId, setAgentId] = useState('');
  const grid = useRef<GridComponent>(null);

  const load = useCallback(() => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Order[]) => setOrders(data.map((o) => ({ ...o, createdAt: new Date(o.createdAt) as unknown as string }))))
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const toArray = (d: unknown) => (Array.isArray(d) ? d : d ? [d] : []) as Order[];
  const onSelect = (args?: { data?: unknown }) =>
    setSelected((prev) => new Map([...prev, ...toArray(args?.data).map((o) => [o.id, o] as const)]));
  const onDeselect = (args?: { data?: unknown }) =>
    setSelected((prev) => {
      const next = new Map(prev);
      toArray(args?.data).forEach((o) => next.delete(o.id));
      return next;
    });
  const onRefunded = () => {
    grid.current?.clearSelection();
    setSelected(new Map());
    load();
  };

  return (
    <section>
      <h2>Orders</h2>
      {error && <p role="alert">Could not load orders: {error}</p>}
      <label>
        Agent ID <input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="e.g. agent-7" />
      </label>
      {agentId.trim() ? (
        <BulkRefund selected={[...selected.values()]} agentId={agentId.trim()} onDone={onRefunded} />
      ) : (
        <p>Enter your agent ID to refund orders.</p>
      )}
      <GridComponent
        ref={grid}
        selectionSettings={{ type: 'Multiple', checkboxOnly: true, persistSelection: true }}
        rowSelected={onSelect}
        rowDeselected={onDeselect}
        dataSource={orders} allowPaging allowSorting allowFiltering pageSettings={{ pageSize: 15 }} filterSettings={{ type: 'Menu' }}>
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="id" headerText="ID" width="80" textAlign="Right" isPrimaryKey />
          <ColumnDirective field="customer" headerText="Customer" width="160" />
          <ColumnDirective field="email" headerText="Email" width="240" />
          <ColumnDirective field="total" headerText="Total" width="110" format="C2" type="number" textAlign="Right" />
          <ColumnDirective field="status" headerText="Status" width="120" />
          <ColumnDirective field="createdAt" headerText="Created" width="140" type="date" format="yMd" />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter]} />
      </GridComponent>
    </section>
  );
}
