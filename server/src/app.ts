import cors from 'cors';
import express from 'express';
import { orders, OrderStatus } from './orders.js';

const validStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];

export function createApp() {
  const app = express();
  app.use(cors());

  app.get('/orders', (req, res) => {
    const statusQuery = req.query.status;
    if (statusQuery !== undefined && statusQuery !== '') {
      if (typeof statusQuery !== 'string' || !validStatuses.includes(statusQuery as OrderStatus)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      const filtered = orders.filter((o) => o.status === statusQuery);
      res.json(filtered);
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
