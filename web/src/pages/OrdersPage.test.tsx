// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrdersPage from './OrdersPage';

describe('OrdersPage', () => {
  it('renders the grid with column headers, grouped by status, with an Excel export button', async () => {
    const { container } = render(<OrdersPage />);
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeTruthy();
    const grid = container.querySelector('.e-grid');
    expect(grid).toBeTruthy();
    for (const h of ['Order #', 'Customer', 'Total', 'Order date']) {
      expect(container.textContent).toContain(h);
    }
    expect(container.querySelector('.e-groupdroparea')).toBeTruthy();
    expect(container.querySelector('[id$="_excelexport"]')).toBeTruthy();
  });
});
