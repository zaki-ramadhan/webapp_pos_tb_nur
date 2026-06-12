import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Export ───────────────────────────────────────────────────────────────────

function getFormattedFilename(filename) {
    let name = filename;
    if (!name || name === 'export' || name === 'ekspor') {
        name = typeof window !== 'undefined' ? window.__activePageId : null;
    }
    const cleanName = String(name || 'ekspor').toLowerCase().trim()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-');

    const mapper = {
        'expense-entries': 'pencatatan-beban',
        'expense-entry': 'pencatatan-beban',
        'bank-transfers': 'transfer-bank',
        'bank-transfer': 'transfer-bank',
        'cash-payments': 'pembayaran-tunai',
        'cash-payment': 'pembayaran-tunai',
        'cash-receipts': 'penerimaan-tunai',
        'cash-receipt': 'penerimaan-tunai',
        'general-journals': 'jurnal-umum',
        'general-journal': 'jurnal-umum',
        'goods-receipts': 'penerimaan-barang',
        'goods-receipt': 'penerimaan-barang',
        'journal-activity-log': 'log-aktifitas-jurnal',
        'journal-activity-logs': 'log-aktifitas-jurnal',
        'payment-orders': 'permintaan-pembayaran',
        'payment-order': 'permintaan-pembayaran',
        'payroll-entries': 'pencatatan-gaji',
        'payroll-entry': 'pencatatan-gaji',
        'price-adjustments': 'penyesuaian-harga',
        'price-adjustment': 'penyesuaian-harga',
        'purchase-orders': 'pesanan-pembelian',
        'purchase-order': 'pesanan-pembelian',
        'sales-checkins': 'checkin-sales',
        'sales-checkin': 'checkin-sales',
        'supplier-prices': 'harga-pemasok',
        'supplier-price': 'harga-pemasok',
        'accounts': 'daftar-akun',
        'account': 'daftar-akun',
        'activity-log': 'log-aktivitas',
        'activity-logs': 'log-aktivitas',
        'asset-categories': 'kategori-aset',
        'asset-category': 'kategori-aset',
        'asset-disposals': 'disposisi-aset',
        'asset-disposal': 'disposisi-aset',
        'asset-moves': 'pemindahan-aset',
        'asset-move': 'pemindahan-aset',
        'asset-tax-categories': 'kategori-pajak-aset',
        'asset-tax-category': 'kategori-pajak-aset',
        'branches': 'cabang',
        'branch': 'cabang',
        'budget-monitors': 'monitoring-anggaran',
        'budget-monitor': 'monitoring-anggaran',
        'budgets': 'anggaran',
        'budget': 'anggaran',
        'budget-transfers': 'transfer-anggaran',
        'budget-transfer': 'transfer-anggaran',
        'company-taxes': 'pajak-perusahaan',
        'company-tax': 'pajak-perusahaan',
        'contacts': 'kontak',
        'contact': 'kontak',
        'currency-masters': 'mata-uang',
        'currency-master': 'mata-uang',
        'customer-categories': 'kategori-pelanggan',
        'customer-category': 'kategori-pelanggan',
        'customers': 'pelanggan',
        'customer': 'pelanggan',
        'departments': 'departemen',
        'department': 'departemen',
        'employees': 'karyawan',
        'employee': 'karyawan',
        'favorite-transactions': 'transaksi-favorit',
        'favorite-transaction': 'transaksi-favorit',
        'fixed-assets': 'aset-tetap',
        'fixed-asset': 'aset-tetap',
        'fob-masters': 'fob-master',
        'fob-master': 'fob-master',
        'group-accesses': 'akses-grup',
        'group-access': 'akses-grup',
        'inventory-adjustments': 'penyesuaian-persediaan',
        'inventory-adjustment': 'penyesuaian-persediaan',
        'item-categories': 'kategori-barang',
        'item-category': 'kategori-barang',
        'item-locations': 'lokasi-barang',
        'item-location': 'lokasi-barang',
        'item-requests': 'permintaan-barang',
        'item-request': 'permintaan-barang',
        'items-services': 'barang-dan-jasa',
        'items-service': 'barang-dan-jasa',
        'item-units': 'satuan-barang',
        'item-unit': 'satuan-barang',
        'material-additions': 'penambahan-bahan',
        'material-addition': 'penambahan-bahan',
        'minimum-stocks': 'stok-minimum',
        'minimum-stock': 'stok-minimum',
        'numberings': 'penomoran',
        'numbering': 'penomoran',
        'order-fulfillments': 'pemenuhan-pesanan',
        'order-fulfillment': 'pemenuhan-pesanan',
        'payment-terms': 'syarat-pembayaran',
        'payment-term': 'syarat-pembayaran',
        'period-ends': 'proses-akhir-bulan',
        'period-end': 'proses-akhir-bulan',
        'preferences': 'pengaturan',
        'preference': 'pengaturan',
        'print-designs': 'desain-cetak',
        'print-design': 'desain-cetak',
        'purchase-deposits': 'uang-muka-pembelian',
        'purchase-deposit': 'uang-muka-pembelian',
        'purchase-invoices': 'faktur-pembelian',
        'purchase-invoice': 'faktur-pembelian',
        'purchase-payments': 'pembayaran-pembelian',
        'purchase-payment': 'pembayaran-pembelian',
        'purchase-returns': 'retur-pembelian',
        'purchase-return': 'retur-pembelian',
        'recurring-transactions': 'transaksi-berulang',
        'recurring-transaction': 'transaksi-berulang',
        'salary-allowances': 'tunjangan-gaji',
        'salary-allowance': 'tunjangan-gaji',
        'sales-categories': 'kategori-penjualan',
        'sales-category': 'kategori-penjualan',
        'sales-commissions': 'komisi-penjualan',
        'sales-commission': 'komisi-penjualan',
        'sales-deliveries': 'pengiriman-penjualan',
        'sales-delivery': 'pengiriman-penjualan',
        'sales-deposits': 'uang-muka-penjualan',
        'sales-deposit': 'uang-muka-penjualan',
        'sales-invoices': 'faktur-penjualan',
        'sales-invoice': 'faktur-penjualan',
        'sales-orders': 'pesanan-penjualan',
        'sales-order': 'pesanan-penjualan',
        'sales-quotes': 'penawaran-penjualan',
        'sales-quote': 'penawaran-penjualan',
        'sales-receipts': 'penerimaan-penjualan',
        'sales-receipt': 'penerimaan-penjualan',
        'sales-targets': 'target-penjualan',
        'sales-target': 'target-penjualan',
        'shipping-masters': 'pengiriman',
        'shipping-master': 'pengiriman',
        'stock-opname-orders': 'perintah-stok-opname',
        'stock-opname-order': 'perintah-stok-opname',
        'stock-opname-results': 'hasil-stok-opname',
        'stock-opname-result': 'hasil-stok-opname',
        'stock-transfers': 'transfer-stok',
        'stock-transfer': 'transfer-stok',
        'supplier-categories': 'kategori-pemasok',
        'supplier-category': 'kategori-pemasok',
        'suppliers': 'pemasok',
        'supplier': 'pemasok',
        'transaction-approvals': 'persetujuan-transaksi',
        'transaction-approval': 'persetujuan-transaksi',
        'users': 'pengguna',
        'user': 'pengguna',
        'warehouse-masters': 'gudang',
        'warehouse-master': 'gudang',
        'work-completions': 'penyelesaian-kerja',
        'work-completion': 'penyelesaian-kerja',
        'work-orders': 'perintah-kerja',
        'work-order': 'perintah-kerja',
    };

    const friendlyName = mapper[cleanName] || cleanName;

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
    const header = activeCols.map(col => `"${String(col.label || '').replace(/"/g, '""')}"`).join(',');

    const body = rows
        .map(row =>
            activeCols
                .map(col => {
                    let val = row[col.id];
                    if (val === undefined || val === null || String(val).trim() === '') {
                        val = isNumericColumn(col, rows) ? '0' : '-';
                    }
                    const str = Array.isArray(val) ? val.join(', ') : String(val);
                    return `"${str.replace(/"/g, '""')}"`;
                })
                .join(','),
        )
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

    const headerRow = activeCols.map(col => col.label || '');
    const dataRows = rows.map(row =>
        activeCols.map(col => {
            let val = row[col.id];
            if (val === undefined || val === null || String(val).trim() === '') {
                return isNumericColumn(col, rows) ? 0 : '-';
            }
            return Array.isArray(val) ? val.join(', ') : val;
        }),
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

    // Calculate column widths (fit-content)
    const colWidths = activeCols.map((col) => {
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

        // Add padding, clamp between 12 and 50 characters
        const optimalWidth = Math.max(12, Math.min(50, maxLen + 4));
        return { wch: optimalWidth };
    });

    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${formattedFilename}.xlsx`);
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
    const headers = [activeCols.map(col => col.label || '')];
    
    const data = rows.map(row => {
        return activeCols.map(col => {
            let val = row[col.id];
            if (val === undefined || val === null || String(val).trim() === '') {
                val = isNumericColumn(col, rows) ? '0' : '-';
            }
            return Array.isArray(val) ? val.join(', ') : String(val);
        });
    });

    const isLandscape = activeCols.length > 6;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const fontSize = isLandscape ? 7 : 8;
    const cellPadding = isLandscape ? 3 : 4;

    const doc = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: 'a4',
    });

    // Set metadata properties
    doc.setProperties({
        title: title,
        subject: `Laporan ${title} - UD. TB Nur`,
        creator: 'UD. TB Nur POS System',
        author: 'UD. TB Nur'
    });

    // Draw page 1 branding header
    const width = doc.internal.pageSize.width;

    // Company Title (UD. TB Nur)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // Navy-900 (#1e3a8a)
    doc.text('UD. TB Nur', 36, 45);

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // Slate-600 (#475569)
    doc.text(title, 36, 62);

    // Timestamp & Stats on the right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500 (#64748b)
    
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

    // Header divider line
    doc.setDrawColor(35, 83, 160); // Brand primary color (#2353a0)
    doc.setLineWidth(2);
    doc.line(36, 75, width - 36, 75);

    // Align column configurations
    const columnStyles = {};
    activeCols.forEach((col, idx) => {
        const align = col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left';
        columnStyles[idx] = { halign: align };
    });

    // Generate AutoTable
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
            lineColor: [226, 232, 240], // Slate-200
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: [35, 83, 160], // Navy-600 (#2353a0)
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Slate-50 (#f8fafc)
        },
        columnStyles: columnStyles,
        theme: 'grid',
    });

    // Add page numbers and headers/footers in post-processing
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // Slate-500

        // Footer Page Number
        const footerText = `Halaman ${i} dari ${totalPages}`;
        doc.text(footerText, width - 36, doc.internal.pageSize.height - 20, { align: 'right' });

        // Header (only for pages > 1)
        if (i > 1) {
            doc.text(`UD. TB Nur — ${title}`, 36, 25);
            doc.setDrawColor(226, 232, 240); // Slate-200
            doc.setLineWidth(0.5);
            doc.line(36, 28, width - 36, 28);
        }
    }

    // Output PDF in a new window/tab as a Blob URL, falling back to direct save if blocked
    try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
            // Popup blocker triggered, download instead
            doc.save(`${getFormattedFilename(title)}.pdf`);
        }
    } catch (e) {
        console.error('Failed to open PDF preview, downloading instead.', e);
        doc.save(`${getFormattedFilename(title)}.pdf`);
    }
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
