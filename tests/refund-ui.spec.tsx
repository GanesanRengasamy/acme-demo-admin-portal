// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RefundDialog from '../web/src/RefundDialog';
import { MAX_REFUND_BATCH, canSelectMore, isRefundable, selectionTotal } from '../web/src/refundSelection';

afterEach(cleanup);

describe('refund selection helpers', () => {
  it('caps a selection at 50', () => {
    expect(MAX_REFUND_BATCH).toBe(50);
    expect(canSelectMore(49)).toBe(true);
    expect(canSelectMore(50)).toBe(false);
  });

  it('sums in cents without float drift', () => {
    expect(selectionTotal([{ total: 0.1 }, { total: 0.2 }])).toBe(0.3);
  });

  it('only paid and shipped orders are refundable', () => {
    expect(isRefundable({ id: 1, total: 1, status: 'paid' })).toBe(true);
    expect(isRefundable({ id: 1, total: 1, status: 'cancelled' })).toBe(false);
  });
});

describe('RefundDialog', () => {
  const orders = [
    { id: 1, total: 10.1 },
    { id: 2, total: 20.2 },
  ];

  it('shows the order count and the refund total', () => {
    render(<RefundDialog orders={orders} submitting={false} error={null} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByTestId('refund-total').textContent).toBe('$30.30');
    expect(screen.getByText(/Refund 2 orders/)).toBeTruthy();
  });

  it('calls onConfirm and onCancel, and disables buttons while submitting', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(<RefundDialog orders={orders} submitting={false} error={null} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm refund' }));
    fireEvent.click(screen.getByText('Cancel'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(<RefundDialog orders={orders} submitting error={null} onConfirm={onConfirm} onCancel={onCancel} />);
    expect((screen.getByText('Refunding…') as HTMLButtonElement).disabled).toBe(true);
  });
});
