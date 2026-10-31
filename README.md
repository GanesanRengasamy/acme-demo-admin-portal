# Acme Admin Portal

A small demo admin portal for Acme. It has an Express API and a React front end.

- `server/`: Express and TypeScript API with 200 in-memory orders.
- `web/`: React, TypeScript and Vite. The Orders page uses the Syncfusion React Data Grid with paging, sorting and filtering in a dark theme.
- `tests/`: Vitest tests.
- `docs/openapi.yaml`: API description.

## Run

Use Node.js 22.

```sh
npm install
npm run dev:server   # API at http://localhost:3001
npm run dev:web      # front end; proxies /api to the API
```

To register a Syncfusion license, copy `web/.env.example` to `web/.env` and set `VITE_SYNCFUSION_LICENSE`.

## Build and test

```sh
npm run build
npm test
```

`tests/checkout.spec.ts` is a known flaky test. It does not await the pricing call, so it fails on some runs.

## API

- `GET /orders` returns all orders.
- `GET /orders/:id` returns one order, or 404.
