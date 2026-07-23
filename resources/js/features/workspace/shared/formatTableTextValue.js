import { formatDisplayValue } from '@/features/workspace/shared/amountFormatting';

export default function formatTableTextValue(value, column = null) {
    const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
    
    if (!isEmpty) {
        if (column) {
            const colId = String(column.id ?? '').toLowerCase();
            const colLabel = String(column.label ?? '').toLowerCase();

            if ((colId.includes('unit') || colLabel.includes('satuan')) && typeof value === 'string') {
                return value.replace(/\s*\[[^\]]+\]|\[[^\]]+\]\s*/g, '').trim();
            }
            
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
                              colId.includes('cost') ||
                              colId.includes('subtotal') ||
                              colId.includes('count') ||
                              colId.includes('stock') ||
                              colId.includes('stok') ||
                              colId.includes('kuantitas') ||
                              colLabel.includes('harga') ||
                              colLabel.includes('jumlah') ||
                              colLabel.includes('nominal') ||
                              colLabel.includes('persen') ||
                              colLabel.includes('nilai') ||
                              colLabel.includes('tarif') ||
                              colLabel.includes('biaya') ||
                              colLabel.includes('banyak') ||
                              colLabel.includes('stok') ||
                              colLabel.includes('subtotal') ||
                              colLabel.includes('kuantitas') ||
                              colLabel.includes('rata');
                              
            if (isNumeric) {
                return formatDisplayValue(value);
            }
        }
        return formatDisplayValue(value);
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
