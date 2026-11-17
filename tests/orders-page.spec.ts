/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersPage from '../web/src/OrdersPage.js';

const mockOrders = [
  { id: 1, customer: 'Ada Lovelace', email: 'ada@example.com', total: 100, status: 'paid', createdAt: '2024-01-02T00:00:00.000Z' },
  { id: 2, customer: 'Grace Hopper', email: 'grace@example.com', total: 150, status: 'shipped', createdAt: '2024-02-15T00:00:00.000Z' },
  { id: 3, customer: 'Alan Turing', email: 'alan@example.com', total: 200, status: 'pending', createdAt: '2024-03-20T00:00:00.000Z' },
];

describe('OrdersPage component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOrders,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders heading and the DateRangePicker above the grid', async () => {
    render(React.createElement(OrdersPage));
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeDefined();
    
    // Check that DateRangePicker input with placeholder is rendered
    const input = await waitFor(() => screen.getByPlaceholderText('Filter by created date'));
    expect(input).toBeDefined();
  });
});
