import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { filenameMapper, titleMapper } from './exportMapper';

// Ekspor

function getFormattedFilename(filename) {
    let name = filename;
    if (!name || name === 'export' || name === 'ekspor') {
        name = typeof window !== 'undefined' ? window.__activePageId : null;
    }
    const cleanName = String(name || 'ekspor').toLowerCase().trim()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-');

    const friendlyName = filenameMapper[cleanName] || cleanName;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return `${friendlyName}_${timestamp}`;
}

export function getFriendlyTitle(name, fallbackTitle = 'Laporan') {
    if (fallbackTitle && fallbackTitle !== 'Laporan' && fallbackTitle !== 'export' && fallbackTitle !== 'ekspor') {
        return fallbackTitle;
    }

    const cleanName = String(name || '').toLowerCase().trim();
    if (!cleanName) return 'Laporan';

    const friendlyName = titleMapper[cleanName];
    if (friendlyName) {
        return `Laporan ${friendlyName}`;
    }

    return fallbackTitle;
}

function isNumericColumn(col, rows) {
    const numericKeys = ['total', 'amount', 'rate', 'value', 'paid', 'price', 'fee', 'percentage'];
    const colIdLower = String(col.id || '').toLowerCase();
    if (numericKeys.some(key => colIdLower.includes(key))) {
        return true;
    }

    if (col.align === 'right') {
        return true;
    }

    let hasValues = false;
    for (const row of rows) {
        const val = row[col.id];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
            hasValues = true;
            const cleaned = String(val)
                .replace(/^rp\s*/i, '')
                .replace(/\./g, '')
                .replace(/,/g, '')
                .trim();

            if (isNaN(Number(cleaned))) {
                return false;
            }
        }
    }

    return hasValues;
}

export function exportToCSV(columns, rows, filename = 'export') {
    const formattedFilename = getFormattedFilename(filename);
    const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');
    const header = ['"No."', ...activeCols.map(col => `"${String(col.label || '').replace(/"/g, '""')}"`)].join(',');

    const body = rows
        .map((row, index) => {
            const noVal = `"${index + 1}"`;
            const rowValues = activeCols.map(col => {
                let val = row[col.id];
                if (val === undefined || val === null || String(val).trim() === '') {
                    val = isNumericColumn(col, rows) ? '0' : '-';
                }
                const str = Array.isArray(val) ? val.join(', ') : String(val);
                return `"${str.replace(/"/g, '""')}"`;
            });
            return [noVal, ...rowValues].join(',');
        })
        .join('\n');

    triggerDownload(
        '\uFEFF' + [header, body].join('\n'),
        'text/csv;charset=utf-8;',
        `${formattedFilename}.csv`,
    );
}

export function exportToExcelXML(columns, rows, filename = 'export') {
    const formattedFilename = getFormattedFilename(filename);
    const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');

    const headerRow = ['No.', ...activeCols.map(col => col.label || '')];
    const dataRows = rows.map((row, index) => [
        index + 1,
        ...activeCols.map(col => {
            let val = row[col.id];
            if (val === undefined || val === null || String(val).trim() === '') {
                return isNumericColumn(col, rows) ? 0 : '-';
            }
            return Array.isArray(val) ? val.join(', ') : val;
        })
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

  // Hitung lebar kolom

    const colWidths = [
        { wch: 6 },
        ...activeCols.map((col) => {
            let maxLen = String(col.label || '').length;

            rows.forEach(row => {
                const val = row[col.id];
                let cellStr = '';
                if (val === undefined || val === null || String(val).trim() === '') {
                    cellStr = isNumericColumn(col, rows) ? '0' : '-';
                } else {
                    cellStr = Array.isArray(val) ? val.join(', ') : String(val);
                }
                maxLen = Math.max(maxLen, cellStr.length);
            });

          // Tambah padding nama

            const optimalWidth = Math.max(12, Math.min(50, maxLen + 4));
            return { wch: optimalWidth };
        })
    ];

    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${formattedFilename}.xlsx`);
}

// Impor

/**
 * Parsing file Excel atau CSV.
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

// Cetak

/**
 * Cetak data tabel ke HTML.
 */
export function printTable(columns, rows, title = 'Laporan') {
    const cleanTitle = getFriendlyTitle(typeof window !== 'undefined' ? window.__activePageId : null, title);
    const activeCols = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');
    const headers = [['No.', ...activeCols.map(col => col.label || '')]];

    const data = rows.map((row, index) => {
        return [
            String(index + 1),
            ...activeCols.map(col => {
                let val = row[col.id];
                if (val === undefined || val === null || String(val).trim() === '') {
                    val = isNumericColumn(col, rows) ? '0' : '-';
                }
                return Array.isArray(val) ? val.join(', ') : String(val);
            })
        ];
    });

    const colCount = activeCols.length;
    let orientation = 'portrait';
    let format = 'a4';

    if (colCount <= 5) {
        orientation = 'portrait';
        format = 'a4';
    } else if (colCount <= 8) {
        orientation = 'landscape';
        format = 'a4';
    } else {
        orientation = 'landscape';
        format = 'a3';
    }

    const fontSize = 9;
    const cellPadding = 4;

    const doc = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: format,
    });

  // Atur properti metadata

    doc.setProperties({
        title: cleanTitle,
        subject: `Laporan ${cleanTitle} - TB Nur`,
        creator: 'TB Nur POS System',
        author: 'TB Nur'
    });

  // Gambar header halaman 1

    const width = doc.internal.pageSize.width;

  // Nama Toko

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('TB Nur', 36, 45);

  // Judul laporan

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(cleanTitle, 36, 58);

  // Tampilkan info waktu & statistik

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    const localeDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const localeTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const timestampStr = `Dibuat pada: ${localeDate} ${localeTime}`;
    const statsStr = `Total data: ${rows.length} entri`;

    doc.text(timestampStr, width - 36, 45, { align: 'right' });
    doc.text(statsStr, width - 36, 58, { align: 'right' });

  // Garis pembatas header

    doc.setDrawColor(35, 83, 160);
    doc.setLineWidth(2);
    doc.line(36, 75, width - 36, 75);

  // Sesuaikan kolom

    const columnStyles = {
        0: { halign: 'center' }
    };
    activeCols.forEach((col, idx) => {
        const align = col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left';
        columnStyles[idx + 1] = { halign: align };
    });

  // Buat AutoTable

    autoTable(doc, {
        head: headers,
        body: data,
        startY: 90,
        margin: { top: 40, bottom: 40, left: 36, right: 36 },
        styles: {
            font: 'helvetica',
            fontSize: fontSize,
            cellPadding: cellPadding,
            valign: 'middle',
            lineColor: [226, 232, 240],
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: [35, 83, 160],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: columnStyles,
        theme: 'grid',
    });

  // Tambah nomor halaman & header/footer

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);

      // Nomor halaman footer

        const footerText = `Halaman ${i} dari ${totalPages}`;
        doc.text(footerText, width - 36, doc.internal.pageSize.height - 20, { align: 'right' });

      // Header halaman > 1

        if (i > 1) {
            doc.text(`TB Nur — ${cleanTitle}`, 36, 25);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(36, 28, width - 36, 28);
        }
    }

  // Buka PDF di window baru

    try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
            doc.save(`${getFormattedFilename(cleanTitle)}.pdf`);
        }
    } catch (e) {
        console.error('Failed to open PDF preview, downloading instead.', e);
        doc.save(`${getFormattedFilename(cleanTitle)}.pdf`);
    }
}

// Private

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
