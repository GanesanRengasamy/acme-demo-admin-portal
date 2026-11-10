import { ColumnDirective, ColumnsDirective, Filter, GridComponent, Inject, Page, Sort } from '@syncfusion/ej2-react-grids';
import { useEffect, useState } from 'react';

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
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = status ? `/api/orders?status=${encodeURIComponent(status)}` : '/api/orders';
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Order[]) => setOrders(data.map((o) => ({ ...o, createdAt: new Date(o.createdAt) as unknown as string }))))
      .catch((e: Error) => setError(e.message));
  }, [status]);

  return (
    <section>
      <h2>Orders</h2>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="status-filter">Status:</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: '6px 12px',
            background: '#1e1e1e',
            color: '#e6e6e6',
            border: '1px solid #333',
            borderRadius: '4px',
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {error && <p role="alert">Could not load orders: {error}</p>}
      <GridComponent dataSource={orders} allowPaging allowSorting allowFiltering pageSettings={{ pageSize: 15 }} filterSettings={{ type: 'Menu' }}>
        <ColumnsDirective>
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
