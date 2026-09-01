export const defaultColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
    { id: 'document_number', label: 'No. Bukti #', widthClassName: 'w-[180px]', align: 'center' },
    { id: 'transaction_type', label: 'Tipe Transaksi', widthClassName: 'w-[180px]', align: 'center' },
    { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[400px]', align: 'left' },
    { id: 'debit', label: 'Debit', widthClassName: 'w-[140px]', align: 'left' },
    { id: 'credit', label: 'Kredit', widthClassName: 'w-[140px]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[120px]', align: 'center' },
    { id: 'action', label: 'Aksi', widthClassName: 'w-[120px]', align: 'center' },
];

export const matchColumns = [
    { id: 'excel', label: 'Mutasi Rekening Koran (Excel)', widthClassName: 'w-[33%]', align: 'left' },
    { id: 'status', label: 'Status Cocok', widthClassName: 'w-[14%]', align: 'center' },
    { id: 'system', label: 'Data Transaksi Sistem (POS/ERP)', widthClassName: 'w-[38%]', align: 'left' },
    { id: 'action', label: 'Aksi Rekonsiliasi', widthClassName: 'w-[15%]', align: 'center' },
];

export const excelColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'center' },
    { id: 'description', label: 'Keterangan Mutasi', widthClassName: 'min-w-[400px]', align: 'left' },
    { id: 'amount', label: 'Nominal', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'type', label: 'Tipe', widthClassName: 'w-[100px]', align: 'center' },
];

export const systemColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
    { id: 'document_number', label: 'No. Bukti #', widthClassName: 'w-[180px]', align: 'center' },
    { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[400px]', align: 'left' },
    { id: 'debit', label: 'Debit', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'credit', label: 'Kredit', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[120px]', align: 'center' },
];
