import cors from 'cors';
import express from 'express';
import { OrderStatus, orders } from './orders.js';

const validStatuses: readonly OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];

export function createApp() {
  const app = express();
  app.use(cors());

  app.get('/orders', (req, res) => {
    const { status } = req.query;
    if (status !== undefined) {
      if (typeof status !== 'string' || !validStatuses.includes(status as OrderStatus)) {
        res.status(400).json({ error: `Invalid status: ${status}` });
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
