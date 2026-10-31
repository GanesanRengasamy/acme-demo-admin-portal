import cors from 'cors';
import express from 'express';
import { orders } from './orders.js';

export function createApp() {
  const app = express();
  app.use(cors());

  app.get('/orders', (_req, res) => {
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
