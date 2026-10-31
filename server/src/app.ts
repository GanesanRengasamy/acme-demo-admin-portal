import cors from 'cors';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { orders } from './orders.js';
import { createRefundService } from './refunds.js';
import type { RefundService } from './refunds.js';

export function createApp(refunds: RefundService = createRefundService(orders)) {
  const app = express();
  app.use(cors({ exposedHeaders: ['Idempotent-Replay'] }));
  app.use(express.json({ limit: '10kb' }));

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

  app.post('/refunds', (req, res) => {
    const body = req.body ?? {};
    const header = req.header('X-Agent-Id')?.trim();
    const result = refunds.refund({ orderIds: body.orderIds, idempotencyKey: body.idempotencyKey, actor: header });
    if (!result.ok) {
      res.status(result.status).json({ error: result.error, orderIds: result.orderIds });
      return;
    }
    if (result.replay) res.set('Idempotent-Replay', 'true');
    res.json(result.body);
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = err.status === 413 ? 413 : 400;
    res.status(status).json({ error: status === 413 ? 'Request too large' : 'Invalid JSON' });
  };
  app.use(onError);

  return app;
}
