import { useMemo, useRef, useState } from 'react';
import { generateOrders, STATUSES } from './data';
import { downloadExcel } from './exportExcel';
import { buildRows, COLUMNS, filterOrders, sortOrders, visibleRange, type ColumnKey, type Filters, type Sort } from './table';

const ROW_HEIGHT = 32;
const VIEWPORT_HEIGHT = 560;
const GRID = '90px 1fr 120px 80px 110px 120px';

export default function OrdersPage() {
  const all = useMemo(() => generateOrders(100_000), []);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<Sort | null>(null);
  const [grouped, setGrouped] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const raf = useRef(0);

  const filtered = useMemo(() => filterOrders(all, filters), [all, filters]);
  const sorted = useMemo(() => sortOrders(filtered, sort), [filtered, sort]);
  const rows = useMemo(() => buildRows(sorted, grouped, collapsed), [sorted, grouped, collapsed]);
  const { start, end } = visibleRange(scrollTop, VIEWPORT_HEIGHT, ROW_HEIGHT, rows.length);

  const toggleSort = (key: ColumnKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));
  const toggleGroup = (status: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      if (!n.delete(status)) n.add(status);
      return n;
    });

  return (
    <section className="orders">
      <h1>Orders</h1>
      <div className="orders-toolbar">
        <label>
          <input type="checkbox" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} /> Group by status
        </label>
        <span className="orders-count">{filtered.length.toLocaleString()} of {all.length.toLocaleString()} orders</span>
        <button type="button" onClick={() => downloadExcel(sorted)}>Export to Excel</button>
      </div>
      <div role="table" aria-label="Orders" aria-rowcount={rows.length + 1} className="orders-table">
        <div role="row" className="orders-row orders-head" style={{ gridTemplateColumns: GRID }}>
          {COLUMNS.map((c) => (
            <div role="columnheader" key={c.key} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <button type="button" className="orders-sort" onClick={() => toggleSort(c.key)}>
                {c.label}{sort?.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
              </button>
            </div>
          ))}
        </div>
        <div role="row" className="orders-row orders-filters" style={{ gridTemplateColumns: GRID }}>
          {COLUMNS.map((c) => (
            <div role="cell" key={c.key}>
              {c.key === 'status' ? (
                <select aria-label="Filter Status" value={filters.status ?? ''} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All</option>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <input aria-label={`Filter ${c.label}`} placeholder="Filter" value={filters[c.key] ?? ''} onChange={(e) => setFilters({ ...filters, [c.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <div
          className="orders-viewport"
          style={{ height: VIEWPORT_HEIGHT }}
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop;
            cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(() => setScrollTop(top));
          }}
        >
          <div style={{ height: rows.length * ROW_HEIGHT, position: 'relative' }}>
            {rows.slice(start, end).map((r, i) => {
              const style = { position: 'absolute' as const, top: (start + i) * ROW_HEIGHT, height: ROW_HEIGHT, gridTemplateColumns: GRID };
              if (r.type === 'group') {
                return (
                  <div role="row" key={`g-${r.status}`} className="orders-row orders-group" style={{ ...style, display: 'block' }}>
                    <button type="button" aria-expanded={!r.collapsed} onClick={() => toggleGroup(r.status)}>
                      {r.collapsed ? '▶' : '▼'} {r.status} ({r.count.toLocaleString()})
                    </button>
                  </div>
                );
              }
              const o = r.order;
              return (
                <div role="row" key={o.id} className="orders-row" style={style}>
                  <div role="cell" className="num">{o.id}</div>
                  <div role="cell">{o.customer}</div>
                  <div role="cell">{o.status}</div>
                  <div role="cell" className="num">{o.items}</div>
                  <div role="cell" className="num">{o.total.toFixed(2)}</div>
                  <div role="cell">{o.createdAt}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
