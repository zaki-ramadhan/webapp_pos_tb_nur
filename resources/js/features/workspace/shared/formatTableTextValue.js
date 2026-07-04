export default function formatTableTextValue(value, column = null) {
    const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
    
    if (!isEmpty) {
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
