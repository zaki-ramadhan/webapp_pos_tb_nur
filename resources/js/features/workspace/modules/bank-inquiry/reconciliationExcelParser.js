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
    if (rawData.length < 2) {
        throw new Error('File Excel kosong atau tidak memiliki data.');
    }

    const headers = rawData[0];
    const dataRows = rawData.slice(1);
    
    let dateIdx = 0, descIdx = 1, amountIdx = 2, typeIdx = -1;

    headers.forEach((h, idx) => {
        const name = String(h || '').toLowerCase().trim();
        if (name.includes('tanggal') || name.includes('date') || name.includes('tgl')) dateIdx = idx;
        else if (name.includes('keterangan') || name.includes('description') || name.includes('narasi')) descIdx = idx;
        else if (name.includes('jumlah') || name.includes('amount') || name.includes('nominal')) amountIdx = idx;
        else if (name.includes('tipe') || name.includes('type') || name.includes('d/k')) typeIdx = idx;
    });

    return dataRows
        .filter(row => row.length > 0 && row[dateIdx] !== undefined)
        .map((row, idx) => {
            let rawDate = row[dateIdx];
            let formattedDate = '';
            if (typeof rawDate === 'number') {
                const dateObj = new Date((rawDate - 25569) * 86400 * 1000);
                formattedDate = dateObj.toISOString().split('T')[0];
            } else {
                try {
                    const parsedDate = new Date(rawDate);
                    formattedDate = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString().split('T')[0] : String(rawDate);
                } catch {
                    formattedDate = String(rawDate);
                }
            }

            let rawAmt = row[amountIdx];
            let numericAmt = typeof rawAmt === 'number' ? rawAmt : parseFloat(String(rawAmt || '').replace(/[^0-9.-]+/g, '')) || 0;

            return {
                id: `excel-${idx}`,
                date: formattedDate,
                description: String(row[descIdx] || '').trim(),
                amount: numericAmt,
                type: typeIdx !== -1 ? String(row[typeIdx] || '').trim() : (numericAmt >= 0 ? 'CR' : 'DB'),
            };
        });
}

export function runReconciliationMatching(excelRows, systemRows) {
    if (!excelRows) return [];

    let unmatchedSystem = [...systemRows];
    let results = [];

    excelRows.forEach((excelRow) => {
        const excelAmt = Math.abs(excelRow.amount);
        const excelDate = new Date(excelRow.date);
        const excelDesc = excelRow.description.toLowerCase();

        let matchedSysRow = null;
        let matchReason = '';
        let matchScore = 0;

        for (let i = 0; i < unmatchedSystem.length; i++) {
            const sysRow = unmatchedSystem[i];
            const sysDocNum = String(sysRow.document_number || sysRow.sourceNumber || '').toLowerCase();
            const sysAmt = sysRow.type === 'Debit' ? parseAmount(sysRow.debit) : parseAmount(sysRow.credit);

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

        if (!matchedSysRow || matchScore < 3) {
            let bestDateMatch = null;
            let bestDaysDiff = 999;

            for (let i = 0; i < unmatchedSystem.length; i++) {
                const sysRow = unmatchedSystem[i];
                const sysAmt = sysRow.type === 'Debit' ? parseAmount(sysRow.debit) : parseAmount(sysRow.credit);

                if (Math.abs(excelAmt - sysAmt) < 0.01) {
                    const sysDate = new Date(sysRow.date);
                    const diffTime = Math.abs(sysDate - excelDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 3 && diffDays < bestDaysDiff) {
                        bestDateMatch = sysRow;
                        bestDaysDiff = diffDays;
                    }
                }
            }

            if (bestDateMatch) {
                matchedSysRow = bestDateMatch;
                matchReason = `Nominal & Tanggal Cocok (Selisih ${bestDaysDiff} hari)`;
                matchScore = 2;
            }
        }

        if (matchedSysRow) {
            unmatchedSystem = unmatchedSystem.filter(item => item.id !== matchedSysRow.id);
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

    unmatchedSystem.forEach((sysRow) => {
        results.push({
            id: `system-only-${sysRow.id}`,
            excel: null,
            system: sysRow,
            status: 'system_only',
            reason: 'Hanya di sistem POS/ERP',
        });
    });

    return results;
}
