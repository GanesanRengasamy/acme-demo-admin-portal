import cors from 'cors';
import express from 'express';
import { orders } from './orders.js';
import { createRefunds } from './refunds.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));

  app.post('/refunds', (req, res) => {
    const result = createRefunds({
      orderIds: req.body?.orderIds,
      idempotencyKey: req.body?.idempotencyKey,
      actor: req.header('X-Agent-Id'),
    });
    res.status(result.status).json(result.body);
  });

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
