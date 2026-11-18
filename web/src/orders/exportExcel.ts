import { COLUMNS } from './table';
import type { Order } from './data';

const esc = (s: string) =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);

/** Builds an Excel-readable SpreadsheetML 2003 workbook (no dependencies). */
export function buildWorkbookXml(orders: Order[]): string {
  const parts: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Worksheet ss:Name="Orders"><Table>',
    '<Row>' + COLUMNS.map((c) => `<Cell><Data ss:Type="String">${esc(c.label)}</Data></Cell>`).join('') + '</Row>',
  ];
  for (const o of orders) {
    parts.push(
      '<Row>' +
        COLUMNS.map((c) => {
          const v = o[c.key];
          return typeof v === 'number'
            ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>`
            : `<Cell><Data ss:Type="String">${esc(String(v))}</Data></Cell>`;
        }).join('') +
        '</Row>',
    );
  }
  parts.push('</Table></Worksheet></Workbook>');
  return parts.join('\n');
}

export function downloadExcel(orders: Order[], filename = 'orders.xls') {
  const blob = new Blob([buildWorkbookXml(orders)], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
