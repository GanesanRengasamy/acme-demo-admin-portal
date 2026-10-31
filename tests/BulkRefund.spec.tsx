// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BulkRefund from '../web/src/BulkRefund.js';
import { sumCents } from '../web/src/refundTotal.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const sel = (n: number, total = 10.1) => Array.from({ length: n }, (_, i) => ({ id: i + 1, total }));

describe('sumCents', () => {
  it('adds decimal totals without float drift', () => {
    expect(sumCents([{ total: 0.1 }, { total: 0.2 }, { total: 20.01 }])).toBe(20.31);
  });
});

describe('BulkRefund', () => {
  it('disables the button when nothing is selected', () => {
    render(<BulkRefund selected={[]} agentId="a1" onDone={() => {}} />);
    expect((screen.getByRole('button', { name: /refund selected/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the count and refund total in a confirmation dialog, and sends nothing until confirmed', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    render(<BulkRefund selected={[{ id: 1, total: 0.1 }, { id: 2, total: 0.2 }, { id: 3, total: 20.01 }]} agentId="a1" onDone={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /refund selected/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/3 orders/)).toBeTruthy();
    expect(within(dialog).getByText('$20.31')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses more than 50 selected orders', () => {
    render(<BulkRefund selected={sel(51)} agentId="a1" onDone={() => {}} />);
    expect((screen.getByRole('button', { name: /refund selected/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('alert').textContent).toMatch(/up to 50/i);
  });

  it('allows exactly 50 selected orders', () => {
    render(<BulkRefund selected={sel(50)} agentId="a1" onDone={() => {}} />);
    expect((screen.getByRole('button', { name: /refund selected/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('posts ids, key and agent header on confirm, then reports success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ total: 20.2, refunds: [] }), { status: 201 }));
    const onDone = vi.fn();
    render(<BulkRefund selected={sel(2)} agentId="agent-9" onDone={onDone} />);
    await userEvent.click(screen.getByRole('button', { name: /refund selected/i }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/refunds');
    expect((init.headers as Record<string, string>)['X-Agent-Id']).toBe('agent-9');
    const body = JSON.parse(init.body as string);
    expect(body.orderIds).toEqual([1, 2]);
    expect(typeof body.idempotencyKey).toBe('string');
    expect(screen.getByRole('status').textContent).toMatch(/refunded 2 orders/i);
  });

  it('reuses the same idempotency key when the agent retries after a failure', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ total: 20.2, refunds: [] }), { status: 201 }));
    render(<BulkRefund selected={sel(2)} agentId="a1" onDone={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /refund selected/i }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/network down/));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const keys = fetchMock.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string).idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
  });

  it('shows the server error and keeps the dialog open', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'Order already refunded' }), { status: 409 }));
    render(<BulkRefund selected={sel(1)} agentId="a1" onDone={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /refund selected/i }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/already refunded/));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
