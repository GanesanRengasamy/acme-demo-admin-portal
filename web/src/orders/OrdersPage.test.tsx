import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrdersPage, { ORDER_COUNT } from './OrdersPage';

describe('OrdersPage', () => {
  it('renders a virtualized grid with sort, filter, group and excel export enabled', () => {
    const { container } = render(<OrdersPage />);
    const grid = (container.querySelector('#OrdersGrid') as any).ej2_instances[0];
    expect(grid.dataSource).toHaveLength(ORDER_COUNT);
    expect(grid.enableVirtualization).toBe(true);
    expect(grid.allowSorting).toBe(true);
    expect(grid.allowFiltering).toBe(true);
    expect(grid.allowGrouping).toBe(true);
    expect(grid.allowExcelExport).toBe(true);
    expect(grid.groupSettings.columns).toEqual(['status']);
    expect(container.querySelectorAll('.e-row').length).toBeLessThan(200);
  });
});
