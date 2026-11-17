import { DateRangePickerComponent, RangeEventArgs } from '@syncfusion/ej2-react-calendars';
import { ColumnDirective, ColumnsDirective, Filter, GridComponent, Inject, Page, Sort } from '@syncfusion/ej2-react-grids';
import { useEffect, useMemo, useState } from 'react';

interface Order {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: Date;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: any[]) =>
        setOrders(
          data.map((o) => ({
            ...o,
            createdAt: new Date(o.createdAt),
          }))
        )
      )
      .catch((e: Error) => setError(e.message));
  }, []);

  const filteredOrders = useMemo(() => {
    const [start, end] = dateRange;
    if (!start && !end) return orders;

    return orders.filter((order) => {
      const orderTime = order.createdAt.getTime();
      if (start) {
        const startTime = new Date(start).setHours(0, 0, 0, 0);
        if (orderTime < startTime) return false;
      }
      if (end) {
        const endTime = new Date(end).setHours(23, 59, 59, 999);
        if (orderTime > endTime) return false;
      }
      return true;
    });
  }, [orders, dateRange]);

  const handleDateRangeChange = (args: RangeEventArgs) => {
    setDateRange([args.startDate ?? null, args.endDate ?? null]);
  };

  return (
    <section>
      <h2>Orders</h2>
      {error && <p role="alert">Could not load orders: {error}</p>}
      <div style={{ marginBottom: 16, maxWidth: 320 }}>
        <DateRangePickerComponent
          id="order-date-range"
          placeholder="Filter by created date"
          startDate={dateRange[0] ?? undefined}
          endDate={dateRange[1] ?? undefined}
          change={handleDateRangeChange}
        />
      </div>
      <GridComponent dataSource={filteredOrders} allowPaging allowSorting allowFiltering pageSettings={{ pageSize: 15 }} filterSettings={{ type: 'Menu' }}>
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
