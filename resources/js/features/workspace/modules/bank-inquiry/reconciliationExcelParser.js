import * as XLSX from 'xlsx';

export const parseAmount = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    let str = String(val).trim();
    if (str.includes('.') && str.includes(',')) {
        const dotIdx = str.indexOf('.');
        const commaIdx = str.indexOf(',');
        if (dotIdx < commaIdx) {
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            str = str.replace(/,/g, '');
        }
    } else if (str.includes(',')) {
        const parts = str.split(',');
        if (parts[parts.length - 1].length === 3) {
            str = str.replace(/,/g, '');
        } else {
            str = str.replace(',', '.');
        }
    } else if (str.includes('.')) {
        const parts = str.split('.');
        if (parts[parts.length - 1].length === 3) {
            str = str.replace(/\./g, '');
        }
    }
    return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
};

export function parseExcelRows(rawData) {
    if (!rawData || rawData.length < 2) {
        throw new Error('File tidak memiliki data baris yang cukup.');
    }

    // Auto-detect header row within the first 15 rows
    let headerRowIdx = -1;
    let dateIdx = -1;
    let descIdx = -1;
    let amountIdx = -1;
    let debitIdx = -1;
    let creditIdx = -1;
    let typeIdx = -1;

    for (let r = 0; r < Math.min(rawData.length, 15); r++) {
        const row = rawData[r];
        if (!Array.isArray(row)) continue;

        let hasDate = false;
        let hasDescOrAmount = false;

        row.forEach((col) => {
            const val = String(col || '').toLowerCase().trim();
            if (val.includes('tanggal') || val.includes('date') || val === 'tgl' || val.includes('tgl.')) {
                hasDate = true;
            } else if (
                val.includes('keterangan') ||
                val.includes('description') ||
                val.includes('narasi') ||
                val.includes('uraian') ||
                val.includes('nominal') ||
                val.includes('jumlah') ||
                val.includes('mutasi') ||
                val.includes('debit') ||
                val.includes('kredit')
            ) {
                hasDescOrAmount = true;
            }
        });

        if (hasDate && hasDescOrAmount) {
            headerRowIdx = r;
            break;
        }
    }

    if (headerRowIdx === -1) {
        headerRowIdx = 0;
    }

    const headers = rawData[headerRowIdx];
    headers.forEach((h, idx) => {
        const name = String(h || '').toLowerCase().trim();
        if (name.includes('tanggal') || name.includes('date') || name === 'tgl' || name.includes('tgl.')) dateIdx = idx;
        else if (name.includes('keterangan') || name.includes('description') || name.includes('narasi') || name.includes('uraian') || name.includes('transaksi') || name.includes('rincian')) descIdx = idx;
        else if (name.includes('debit') || name === 'db' || name.includes('keluar') || name.includes('pengeluaran')) debitIdx = idx;
        else if (name.includes('kredit') || name === 'cr' || name.includes('masuk') || name.includes('penerimaan')) creditIdx = idx;
        else if (name.includes('jumlah') || name.includes('amount') || name.includes('nominal') || name.includes('mutasi') || name.includes('nilai')) amountIdx = idx;
        else if (name.includes('tipe') || name.includes('type') || name.includes('d/k') || name.includes('status')) typeIdx = idx;
    });

    if (dateIdx === -1) dateIdx = 0;
    if (descIdx === -1) descIdx = 1;

    const dataRows = rawData.slice(headerRowIdx + 1);

    return dataRows
        .filter((row) => {
            if (!Array.isArray(row) || row.length === 0) return false;
            const dateVal = String(row[dateIdx] || '').trim();
            if (!dateVal) return false;
            const descVal = String(row[descIdx] || '').toLowerCase().trim();
            if (descVal.startsWith('total') || descVal.startsWith('saldo') || descVal.startsWith('grand total')) return false;
            return true;
        })
        .map((row, idx) => {
            let rawDate = row[dateIdx];
            let formattedDate = '';
            if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
                formattedDate = rawDate.toISOString().split('T')[0];
            } else if (typeof rawDate === 'number') {
                const dateObj = new Date((rawDate - 25569) * 86400 * 1000);
                formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';
            } else {
                const str = String(rawDate || '').trim();
                const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (dmyMatch) {
                    const [, d, m, y] = dmyMatch;
                    formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                } else {
                    const parsed = new Date(str);
                    formattedDate = !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : str;
                }
            }

            let numericAmt = 0;
            let type = 'CR';

            if (debitIdx !== -1 && creditIdx !== -1) {
                const deb = parseAmount(row[debitIdx]);
                const cre = parseAmount(row[creditIdx]);
                if (cre > 0) {
                    numericAmt = cre;
                    type = 'CR';
                } else if (deb > 0) {
                    numericAmt = deb;
                    type = 'DB';
                }
            } else if (amountIdx !== -1) {
                numericAmt = parseAmount(row[amountIdx]);
                if (typeIdx !== -1) {
                    const tStr = String(row[typeIdx] || '').toUpperCase().trim();
                    type = tStr.includes('DB') || tStr.includes('K') || tStr.includes('D') ? 'DB' : 'CR';
                } else {
                    type = numericAmt >= 0 ? 'CR' : 'DB';
                    numericAmt = Math.abs(numericAmt);
                }
            }

            return {
                id: `statement-${idx + 1}`,
                date: formattedDate,
                description: String(row[descIdx] || '').trim(),
                amount: Math.abs(numericAmt),
                type,
            };
        });
}

export async function parseBankStatementFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    throw new Error('File tidak memiliki lembar kerja (worksheet).');
                }
                const worksheet = workbook.Sheets[firstSheetName];
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const rows = parseExcelRows(rawData);
                resolve({ fileName: file.name, rows });
            } catch (err) {
                reject(new Error(err.message || 'Gagal membaca isi file rekening koran.'));
            }
        };
        reader.onerror = () => reject(new Error('Gagal mengakses berkas file.'));
        reader.readAsArrayBuffer(file);
    });
}

export function runReconciliationMatching(excelRows, systemRows) {
    if (!excelRows || excelRows.length === 0) return [];

    let unmatchedSystem = [...(systemRows || [])];
    let results = [];

    excelRows.forEach((excelRow) => {
        const excelAmt = Math.abs(excelRow.amount);
        const excelDate = new Date(excelRow.date);
        const excelDesc = (excelRow.description || '').toLowerCase();

        let matchedSysRow = null;
        let matchReason = '';
        let matchScore = 0;

        // 1. Check Document Number in Description & Exact Amount
        for (let i = 0; i < unmatchedSystem.length; i++) {
            const sysRow = unmatchedSystem[i];
            const sysDocNum = String(sysRow.document_number || sysRow.sourceNumber || sysRow.documentNumber || '').toLowerCase();
            const deb = parseAmount(sysRow.debit);
            const cre = parseAmount(sysRow.credit);
            const sysAmt = deb > 0 ? deb : cre;

            if (sysDocNum && excelDesc.includes(sysDocNum)) {
                if (Math.abs(excelAmt - sysAmt) < 0.01) {
                    matchedSysRow = sysRow;
                    matchReason = 'Nomor Bukti & Nominal Cocok';
                    matchScore = 3;
                    break;
                } else {
                    matchedSysRow = sysRow;
                    matchReason = 'Nomor Bukti Cocok, Nominal Berbeda';
                    matchScore = 1;
                }
            }
        }

        // 2. Check Amount & Close Date (within 3 days)
        if (!matchedSysRow || matchScore < 3) {
            let bestDateMatch = null;
            let bestDaysDiff = 999;

            for (let i = 0; i < unmatchedSystem.length; i++) {
                const sysRow = unmatchedSystem[i];
                const deb = parseAmount(sysRow.debit);
                const cre = parseAmount(sysRow.credit);
                const sysAmt = deb > 0 ? deb : cre;

                if (Math.abs(excelAmt - sysAmt) < 0.01) {
                    const sysDate = new Date(sysRow.date);
                    if (!isNaN(sysDate.getTime()) && !isNaN(excelDate.getTime())) {
                        const diffTime = Math.abs(sysDate - excelDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays <= 3 && diffDays < bestDaysDiff) {
                            bestDateMatch = sysRow;
                            bestDaysDiff = diffDays;
                        }
                    }
                }
            }

            if (bestDateMatch) {
                matchedSysRow = bestDateMatch;
                matchReason = bestDaysDiff === 0
                    ? 'Nominal & Tanggal Sama Persis'
                    : `Nominal & Tanggal Cocok (Selisih ${bestDaysDiff} hari)`;
                matchScore = 2;
            }
        }

        if (matchedSysRow) {
            unmatchedSystem = unmatchedSystem.filter((item) => item !== matchedSysRow);
            results.push({
                id: `match-${excelRow.id}`,
                excel: excelRow,
                system: matchedSysRow,
                status: matchScore >= 2 ? 'matched' : 'discrepancy',
                reason: matchReason,
            });
        } else {
            results.push({
                id: `excel-only-${excelRow.id}`,
                excel: excelRow,
                system: null,
                status: 'excel_only',
                reason: 'Hanya di Rekening Koran',
            });
        }
    });

    unmatchedSystem.forEach((sysRow, idx) => {
        results.push({
            id: `system-only-${sysRow.id || sysRow.document_number || idx}`,
            excel: null,
            system: sysRow,
            status: 'system_only',
            reason: 'Hanya di Sistem',
        });
    });

    return results;
}
