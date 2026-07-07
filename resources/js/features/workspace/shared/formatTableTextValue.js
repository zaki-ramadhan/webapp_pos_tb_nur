export default function formatTableTextValue(value, column = null) {
    const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
    
    if (!isEmpty) {
        if (column) {
            const colId = String(column.id ?? '').toLowerCase();
            const colLabel = String(column.label ?? '').toLowerCase();
            
            const isNameColumn = colId.includes('customer') || 
                                 colId.includes('supplier') || 
                                 colId.includes('payee') || 
                                 colId.includes('client') ||
                                 colId.includes('employee') ||
                                 colLabel.includes('pelanggan') || 
                                 colLabel.includes('pemasok') || 
                                 colLabel.includes('penerima') ||
                                 colLabel.includes('karyawan');
                                 
            if (isNameColumn && typeof value === 'string') {
                value = value.replace(/^(?:bapak|bapak\.|bpk|bpk\.|ibu|ibu\.|ib|ib\.|saudara|saudara\.|sdr|sdr\.|tuan|tuan\.|tn|tn\.|nyonya|nyonya\.|ny|ny\.)\s+/i, '');
            }

            const isNumeric = column.align === 'right' ||
                              colId.includes('price') || 
                              colId.includes('amount') || 
                              colId.includes('qty') || 
                              colId.includes('quantity') || 
                              colId.includes('rate') || 
                              colId.includes('total') || 
                              colId.includes('balance') || 
                              colId.includes('limit') || 
                              colId.includes('nominal') || 
                              colId.includes('tax') || 
                              colId.includes('discount') || 
                              colId.includes('allowance') || 
                              colId.includes('value') ||
                              colId.includes('age') ||
                              colId.includes('salary') ||
                              colId.includes('income') ||
                              colId.includes('debit') ||
                              colId.includes('credit') ||
                              colId.includes('mutation') ||
                              colLabel.includes('harga') ||
                              colLabel.includes('jumlah') ||
                              colLabel.includes('nominal') ||
                              colLabel.includes('persen') ||
                              colLabel.includes('nilai') ||
                              colLabel.includes('tarif');
                              
            if (isNumeric) {
                let strVal = String(value).trim();
                if (/^-?\d+(\.\d+)?$/.test(strVal)) {
                    const num = parseFloat(strVal);
                    return new Intl.NumberFormat('id-ID', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 2 
                    }).format(num);
                }
            }
        }
        return value;
    }

    if (column) {
        const colId = String(column.id ?? '').toLowerCase();
        const colLabel = String(column.label ?? '').toLowerCase();
        
        const isNumeric = column.align === 'right' ||
                          colId.includes('price') || 
                          colId.includes('amount') || 
                          colId.includes('qty') || 
                          colId.includes('quantity') || 
                          colId.includes('rate') || 
                          colId.includes('total') || 
                          colId.includes('balance') || 
                          colId.includes('limit') || 
                          colId.includes('nominal') || 
                          colId.includes('tax') || 
                          colId.includes('discount') || 
                          colId.includes('allowance') || 
                          colId.includes('value') ||
                          colId.includes('age') ||
                          colId.includes('salary') ||
                          colId.includes('income') ||
                          colId.includes('debit') ||
                          colId.includes('credit') ||
                          colLabel.includes('harga') ||
                          colLabel.includes('jumlah') ||
                          colLabel.includes('nominal') ||
                          colLabel.includes('persen') ||
                          colLabel.includes('nilai') ||
                          colLabel.includes('tarif');
                          
        if (isNumeric) {
            return '0';
        }
    }

    return '-';
}
