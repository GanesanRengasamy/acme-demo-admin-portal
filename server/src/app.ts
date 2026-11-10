import cors from 'cors';
import express from 'express';
import { OrderStatus, orders } from './orders.js';

const ALLOWED_STATUSES: readonly OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];

function isOrderStatus(value: string): value is OrderStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export function createApp() {
  const app = express();
  app.use(cors());

  app.get('/orders', (req, res) => {
    const status = req.query.status;
    if (status !== undefined) {
      if (typeof status !== 'string' || !isOrderStatus(status)) {
        res.status(400).json({ error: `Unknown status: ${status}` });
        return;
      }
      res.json(orders.filter((o) => o.status === status));
      return;
    }
    res.json(orders);
  });

  app.get('/orders/:id', (req, res) => {
    const order = orders.find((o) => String(o.id) === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  });

  return app;
}
