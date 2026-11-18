import {
  ColumnDirective, ColumnsDirective, ExcelExport, Filter, GridComponent, Group, Inject, Sort, Toolbar, VirtualScroll,
} from '@syncfusion/ej2-react-grids';
import { useMemo, useRef } from 'react';
import { generateOrders } from './generateOrders';

export const ORDER_COUNT = 100_000;

export default function LargeOrdersPage() {
  const grid = useRef<GridComponent>(null);
  const data = useMemo(() => generateOrders(ORDER_COUNT), []);

  const toolbarClick = (args: { item: { id: string } }) => {
    if (args.item.id.endsWith('_excelexport')) void grid.current?.excelExport();
  };

  return (
    <section>
      <h2>Orders ({ORDER_COUNT.toLocaleString()})</h2>
      <GridComponent
        ref={grid}
        dataSource={data}
        height={500}
        enableVirtualization
        allowSorting
        allowFiltering
        allowGrouping
        allowExcelExport
        filterSettings={{ type: 'Menu' }}
        groupSettings={{ columns: ['status'] }}
        toolbar={['ExcelExport']}
        toolbarClick={toolbarClick}
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="ID" width="100" textAlign="Right" isPrimaryKey />
          <ColumnDirective field="customer" headerText="Customer" width="160" />
          <ColumnDirective field="email" headerText="Email" width="260" />
          <ColumnDirective field="total" headerText="Total" width="110" format="C2" type="number" textAlign="Right" />
          <ColumnDirective field="status" headerText="Status" width="120" />
          <ColumnDirective field="createdAt" headerText="Created" width="140" type="date" format="yMd" />
        </ColumnsDirective>
        <Inject services={[VirtualScroll, Sort, Filter, Group, Toolbar, ExcelExport]} />
      </GridComponent>
    </section>
  );
}
