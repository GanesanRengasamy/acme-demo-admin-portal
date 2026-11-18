import { useMemo, useRef } from 'react';
import {
  ColumnDirective,
  ColumnsDirective,
  ExcelExport,
  Filter,
  Group,
  GridComponent,
  Inject,
  Sort,
  Toolbar,
  VirtualScroll,
} from '@syncfusion/ej2-react-grids';
import '@syncfusion/ej2-bootstrap5-dark-theme/styles/bootstrap5-dark.css';
import { generateOrders } from '../orders';

export const ORDER_COUNT = 100_000;

export default function OrdersPage() {
  const grid = useRef<GridComponent>(null);
  const data = useMemo(() => generateOrders(ORDER_COUNT), []);

  const toolbarClick = (args?: { item: { id: string } }) => {
    if (args?.item.id.endsWith('_excelexport')) {
      void grid.current?.excelExport();
    }
  };

  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title">Orders</h2>
      <GridComponent
        ref={grid}
        dataSource={data}
        height={600}
        rowHeight={36}
        enableVirtualization
        allowSorting
        allowFiltering
        allowGrouping
        allowExcelExport
        filterSettings={{ type: 'Excel' }}
        groupSettings={{ columns: ['status'] }}
        toolbar={['ExcelExport']}
        toolbarClick={toolbarClick}
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="Order #" width={110} textAlign="Right" isPrimaryKey />
          <ColumnDirective field="customer" headerText="Customer" width={180} />
          <ColumnDirective field="status" headerText="Status" width={130} />
          <ColumnDirective field="total" headerText="Total" width={120} format="C2" textAlign="Right" />
          <ColumnDirective field="orderDate" headerText="Order date" width={140} type="date" format="yMd" />
        </ColumnsDirective>
        <Inject services={[VirtualScroll, Sort, Filter, Group, Toolbar, ExcelExport]} />
      </GridComponent>
    </section>
  );
}
