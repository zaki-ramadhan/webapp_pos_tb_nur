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

    const headerCells = activeCols.map(col => `<th>${esc(col.label || '')}</th>`).join('');
    const bodyRows = rows
        .map(row => {
            const cells = activeCols
                .map(col => {
                    const val = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : '';
                    const str = Array.isArray(val) ? val.join(', ') : String(val);
                    return `<td>${esc(str)}</td>`;
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
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; }
    h2 { margin: 0 0 12px; font-size: 15px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #c0c8d5; padding: 5px 8px; text-align: left; }
    th { background: #2353a0; color: #fff; font-weight: 600; }
    tr:nth-child(even) { background: #f3f5fb; }
    @media print { @page { margin: 1cm; } }
  </style>
</head>
<body>
  <h2>${esc(title)}</h2>
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
    win.print();
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
