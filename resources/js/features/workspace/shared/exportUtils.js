import * as XLSX from 'xlsx';

// ─── Export ───────────────────────────────────────────────────────────────────

export function exportToCSV(columns, rows, filename = 'export') {
    const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');
    const header = activeCols.map(col => `"${String(col.label || '').replace(/"/g, '""')}"`).join(',');

    const body = rows
        .map(row =>
            activeCols
                .map(col => {
                    const val = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : '';
                    const str = Array.isArray(val) ? val.join(', ') : String(val);
                    return `"${str.replace(/"/g, '""')}"`;
                })
                .join(','),
        )
        .join('\n');

    triggerDownload(
        '\uFEFF' + [header, body].join('\n'),
        'text/csv;charset=utf-8;',
        `${filename}.csv`,
    );
}

export function exportToExcelXML(columns, rows, filename = 'export') {
    const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');

    const headerRow = activeCols.map(col => col.label || '');
    const dataRows = rows.map(row =>
        activeCols.map(col => {
            const val = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : '';
            return Array.isArray(val) ? val.join(', ') : val;
        }),
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ─── Import ───────────────────────────────────────────────────────────────────

/**
 * Parse an Excel (.xlsx/.xls) or CSV file selected via <input type="file">.
 * Returns a Promise that resolves to { headers: string[], rows: Record<string, string>[] }.
 */
export function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const jsonRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

                if (!jsonRows.length) {
                    resolve({ headers: [], rows: [] });
                    return;
                }

                const headers = jsonRows[0].map(String);
                const rows = jsonRows.slice(1).map(rowArr => {
                    const obj = {};
                    headers.forEach((h, i) => {
                        obj[h] = rowArr[i] !== undefined ? String(rowArr[i]) : '';
                    });
                    return obj;
                });

                resolve({ headers, rows });
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(new Error('Gagal membaca file.'));
        reader.readAsArrayBuffer(file);
    });
}

// ─── Print ────────────────────────────────────────────────────────────────────

/**
 * Print the visible table data as a simple styled HTML page in a new window.
 * columns: { id, label }[]
 * rows: Record<string, any>[]
 * title: string
 */
export function printTable(columns, rows, title = 'Laporan') {
    const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');

    const headerCells = activeCols
        .map(col => {
            const align = col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left';
            return `<th style="text-align: ${align};">${esc(col.label || '')}</th>`;
        })
        .join('');

    const bodyRows = rows
        .map(row => {
            const cells = activeCols
                .map(col => {
                    const val = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : '';
                    const str = Array.isArray(val) ? val.join(', ') : String(val);
                    const align = col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left';
                    return `<td style="text-align: ${align};">${esc(str)}</td>`;
                })
                .join('');
            return `<tr>${cells}</tr>`;
        })
        .join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      font-size: 11px;
      line-height: 1.5;
      margin: 24px;
      background: #ffffff;
    }
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #2353a0;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header-left {
      text-align: left;
    }
    .header-right {
      text-align: right;
    }
    .company-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e3a8a;
      letter-spacing: -0.025em;
    }
    .report-title {
      font-size: 14px;
      font-weight: 600;
      margin-top: 4px;
      color: #475569;
    }
    .print-meta {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
    }
    th {
      background: #2353a0;
      color: #ffffff;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.05em;
    }
    tr {
      page-break-inside: avoid;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    @media print {
      @page {
        margin: 1.5cm;
      }
      body {
        margin: 0;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      table, th, td {
        border: 1px solid #94a3b8 !important;
      }
      .print-header {
        border-bottom-color: #1e3a8a;
      }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="header-left">
      <div class="company-title">UD. TB Nur</div>
      <div class="report-title">${esc(title)}</div>
    </div>
    <div class="header-right">
      <div class="print-meta">Dibuat pada: ${new Date().toLocaleString('id-ID')}</div>
      <div class="print-meta">Total data: ${rows.length} entri</div>
    </div>
  </div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    
    // Delayed print trigger to allow DOM painting and style calculations in modern browsers.
    setTimeout(() => {
        win.print();
    }, 350);
}

// ─── Private ──────────────────────────────────────────────────────────────────

function triggerDownload(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
