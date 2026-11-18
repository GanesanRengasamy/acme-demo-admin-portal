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
import { useMemo, useRef } from 'react';
import { generateOrders } from './generateOrders';
import './syncfusion.css';

export const ORDER_COUNT = 100_000;

export default function OrdersPage() {
  const gridRef = useRef<GridComponent>(null);
  const data = useMemo(() => generateOrders(ORDER_COUNT), []);

  const toolbarClick = (args: { item: { id: string } }) => {
    if (args.item.id === 'OrdersGrid_excelexport') {
      void gridRef.current?.excelExport({ fileName: 'orders.xlsx' });
    }
  };

  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title">Orders</h2>
      <GridComponent
        id="OrdersGrid"
        ref={gridRef}
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
          <ColumnDirective field="id" headerText="Order ID" width={110} textAlign="Right" isPrimaryKey />
          <ColumnDirective field="customer" headerText="Customer" width={170} />
          <ColumnDirective field="email" headerText="Email" width={240} />
          <ColumnDirective field="status" headerText="Status" width={130} />
          <ColumnDirective field="total" headerText="Total" width={120} format="C2" textAlign="Right" />
          <ColumnDirective field="createdAt" headerText="Created" width={140} type="date" format="yMd" />
        </ColumnsDirective>
        <Inject services={[VirtualScroll, Sort, Filter, Group, Toolbar, ExcelExport]} />
      </GridComponent>
    </section>
  );
}
