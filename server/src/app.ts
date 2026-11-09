import cors from 'cors';
import express from 'express';
import { orders } from './orders.js';

export function createApp() {
  const app = express();
  app.use(cors());

  app.get('/orders', (req, res) => {
    let limit = 50;
    let offset = 0;

    if (req.query.limit !== undefined) {
      const rawLimit = String(req.query.limit);
      if (!/^\d+$/.test(rawLimit)) {
        res.status(400).json({ error: 'limit must be a whole number' });
        return;
      }
      const parsedLimit = Number(rawLimit);
      if (parsedLimit < 1 || parsedLimit > 200) {
        res.status(400).json({ error: 'limit must be between 1 and 200' });
        return;
      }
      limit = parsedLimit;
    }

    if (req.query.offset !== undefined) {
      const rawOffset = String(req.query.offset);
      if (!/^\d+$/.test(rawOffset)) {
        res.status(400).json({ error: 'offset must be a whole number' });
        return;
      }
      const parsedOffset = Number(rawOffset);
      if (parsedOffset < 0) {
        res.status(400).json({ error: 'offset must be greater than or equal to 0' });
        return;
      }
      offset = parsedOffset;
    }

    res.json(orders.slice(offset, offset + limit));
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
