import { ColumnDirective, ColumnsDirective, ExcelExport, Filter, GridComponent, Inject, Page, Sort, Toolbar } from '@syncfusion/ej2-react-grids';
import { ColumnSeries, ChartComponent, Category, DataLabel, Inject as ChartInject, SeriesCollectionDirective, SeriesDirective, Tooltip } from '@syncfusion/ej2-react-charts';
import { Day, Inject as SchedInject, ScheduleComponent, Week } from '@syncfusion/ej2-react-schedule';
import { useEffect, useMemo, useRef, useState } from 'react';
import { deliveriesFromOrders, revenueByMonth, type Order } from './dashboard';

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const grid = useRef<GridComponent>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Order[]) => setOrders(data))
      .catch((e: Error) => setError(e.message));
  }, []);

  const gridData = useMemo(() => orders.map((o) => ({ ...o, createdAt: new Date(o.createdAt) })), [orders]);
  const revenue = useMemo(() => revenueByMonth(orders), [orders]);
  const deliveries = useMemo(() => deliveriesFromOrders(orders), [orders]);
  const scheduleDate = useMemo(
    () => (deliveries.length ? new Date(Math.max(...deliveries.map((d) => d.StartTime.getTime())) - 7 * 86_400_000) : new Date()),
    [deliveries],
  );

  return (
    <section className="dashboard">
      <h2>Orders dashboard</h2>
      {error && <p role="alert">Could not load orders: {error}</p>}

      <h3>Orders</h3>
      <GridComponent
        ref={grid}
        dataSource={gridData}
        allowPaging
        allowSorting
        allowFiltering
        allowExcelExport
        toolbar={['ExcelExport']}
        pageSettings={{ pageSize: 10 }}
        filterSettings={{ type: 'Menu' }}
        toolbarClick={(args) => {
          if (args?.item.id?.endsWith('_excelexport')) grid.current?.excelExport({ fileName: 'orders.xlsx' });
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="ID" width="80" textAlign="Right" isPrimaryKey />
          <ColumnDirective field="customer" headerText="Customer" width="160" />
          <ColumnDirective field="email" headerText="Email" width="240" />
          <ColumnDirective field="total" headerText="Total" width="110" format="C2" type="number" textAlign="Right" />
          <ColumnDirective field="status" headerText="Status" width="120" />
          <ColumnDirective field="createdAt" headerText="Created" width="140" type="date" format="yMd" />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Toolbar, ExcelExport]} />
      </GridComponent>

      <h3>Revenue by month</h3>
      <ChartComponent
        primaryXAxis={{ valueType: 'Category', title: 'Month' }}
        primaryYAxis={{ title: 'Revenue (USD)', labelFormat: 'C0' }}
        theme="MaterialDark"
        legendSettings={{ visible: false }}
        tooltip={{ enable: true }}
        title="Revenue by month (excluding cancelled)"
      >
        <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel]} />
        <SeriesCollectionDirective>
          <SeriesDirective dataSource={revenue} xName="month" yName="revenue" type="Column" name="Revenue" />
        </SeriesCollectionDirective>
      </ChartComponent>

      <h3>Deliveries</h3>
      <ScheduleComponent
        currentView="Week"
        selectedDate={scheduleDate}
        height="520px"
        readonly
        startHour="08:00"
        endHour="19:00"
        eventSettings={{ dataSource: deliveries }}
      >
        <SchedInject services={[Day, Week]} />
      </ScheduleComponent>
    </section>
  );
}
