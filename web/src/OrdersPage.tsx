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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Order[]) => setOrders(data.map((o) => ({ ...o, createdAt: new Date(o.createdAt) as unknown as string }))))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section>
      <h2>Orders</h2>
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
