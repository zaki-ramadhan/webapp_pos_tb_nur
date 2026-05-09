function createSearchControl() {
    return {
        id: 'keyword',
        type: 'search',
        value: '',
        placeholder: 'Cari/Pilih...',
        wrapperClassName: 'min-w-0 flex-[999_1_280px] basis-full xl:basis-auto',
        className: 'w-full',
    };
}

function createDateControl(id, value) {
    return {
        id,
        type: 'date',
        value,
        wrapperClassName: 'w-full sm:w-[200px] md:w-[220px]',
        className: 'w-full',
    };
}

function createAction(id, icon, label, tone = 'default') {
    return {
        id,
        icon,
        label,
        tone,
    };
}

const DEFAULT_CONTROLS = [
    createSearchControl(),
    createDateControl('startDate', '01/04/2026'),
    {
        type: 'label',
        label: 's/d',
        wrapperClassName: 'px-1 text-center',
    },
    createDateControl('endDate', '30/04/2026'),
];

const DEFAULT_EMPTY_SPACE_CLASS_NAME = 'min-h-[320px] sm:min-h-[420px] xl:min-h-[64vh]';

export const bankInquiryPageConfigs = {
    'account-history': {
        controls: DEFAULT_CONTROLS,
        actions: [
            createAction('reload', 'link', 'Muat ulang histori akun'),
            createAction('open-reference', 'external-link', 'Buka referensi histori akun'),
            createAction('switch-account', 'transfer', 'Pindah akun perkiraan'),
            createAction('help', 'idea', 'Bantuan histori akun', 'warning'),
        ],
        table: {
            columns: [
                { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
                { id: 'sourceNumber', label: 'No. Sumber #', widthClassName: 'w-[180px]', align: 'center' },
                { id: 'transactionType', label: 'Tipe Transaksi', widthClassName: 'w-[170px]', align: 'center' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[720px]', align: 'center' },
                { id: 'mutation', label: 'Mutasi', widthClassName: 'w-[150px]', align: 'center' },
                { id: 'type', label: 'Tipe', widthClassName: 'w-[80px]', align: 'center' },
                { id: 'balance', label: 'Saldo', widthClassName: 'w-[160px]', align: 'center' },
            ],
            rows: [],
            emptyLabel: 'Belum ada data',
            emptySpaceClassName: DEFAULT_EMPTY_SPACE_CLASS_NAME,
            tableClassName: 'min-w-[1560px]',
            searchKeys: ['date', 'sourceNumber', 'transactionType', 'description', 'mutation', 'type', 'balance'],
        },
        sidePanel: {
            hidden: true,
        },
    },
    'bank-statement': {
        controls: DEFAULT_CONTROLS,
        actions: [
            createAction('reload', 'link', 'Muat ulang rekening koran'),
            createAction('help', 'idea', 'Bantuan rekening koran', 'warning'),
        ],
        table: {
            columns: [
                { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[520px]', align: 'center' },
                { id: 'mutation', label: 'Mutasi', widthClassName: 'w-[150px]', align: 'center' },
                { id: 'type', label: 'Tipe', widthClassName: 'w-[80px]', align: 'center' },
                { id: 'balance', label: 'Saldo', widthClassName: 'w-[200px]', align: 'center' },
                { id: 'index', label: '#', widthClassName: 'w-[42px]', align: 'center', noWrap: true },
            ],
            rows: [],
            emptyLabel: 'Belum ada data',
            emptySpaceClassName: DEFAULT_EMPTY_SPACE_CLASS_NAME,
            tableClassName: 'min-w-[1100px]',
            searchKeys: ['date', 'description', 'mutation', 'type', 'balance'],
        },
        sidePanel: {
            className: DEFAULT_EMPTY_SPACE_CLASS_NAME,
        },
    },
    'bank-history': {
        controls: DEFAULT_CONTROLS,
        actions: [
            createAction('reload', 'link', 'Muat ulang histori bank'),
            createAction('open-linked', 'external-link', 'Buka referensi histori bank'),
            createAction('switch-account', 'transfer', 'Pindah akun bank'),
            createAction('help', 'idea', 'Bantuan histori bank', 'warning'),
        ],
        table: {
            columns: [
                { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
                { id: 'sourceNumber', label: 'No. Sumber #', widthClassName: 'w-[160px]', align: 'center' },
                { id: 'checkNumber', label: 'No Cek #', widthClassName: 'w-[130px]', align: 'center' },
                { id: 'transactionType', label: 'Tipe Transaksi', widthClassName: 'w-[180px]', align: 'center' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[700px]', align: 'center' },
                { id: 'mutation', label: 'Mutasi', widthClassName: 'w-[140px]', align: 'center' },
                { id: 'type', label: 'Tipe', widthClassName: 'w-[80px]', align: 'center' },
                { id: 'balance', label: 'Saldo', widthClassName: 'w-[150px]', align: 'center' },
                { id: 'index', label: '#', widthClassName: 'w-[42px]', align: 'center', noWrap: true },
            ],
            rows: [],
            emptyLabel: 'Belum ada data',
            emptySpaceClassName: DEFAULT_EMPTY_SPACE_CLASS_NAME,
            tableClassName: 'min-w-[1700px]',
            searchKeys: ['date', 'sourceNumber', 'checkNumber', 'transactionType', 'description', 'mutation', 'type', 'balance'],
        },
        sidePanel: {
            hidden: true,
        },
    },
    'bank-reconciliation': {
        controls: DEFAULT_CONTROLS,
        actions: [
            createAction('reload', 'link', 'Muat ulang rekonsiliasi bank'),
            createAction('switch-account', 'transfer', 'Pindah akun bank'),
            createAction('help', 'idea', 'Bantuan rekonsiliasi bank', 'warning'),
        ],
        table: {
            columns: [
                { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
                { id: 'documentNumber', label: 'No. Bukti #', widthClassName: 'w-[180px]', align: 'center' },
                { id: 'transactionType', label: 'Tipe Transaksi', widthClassName: 'w-[180px]', align: 'center' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[560px]', align: 'center' },
                { id: 'debit', label: 'Debit', widthClassName: 'w-[140px]', align: 'center' },
                { id: 'credit', label: 'Kredit', widthClassName: 'w-[140px]', align: 'center' },
                { id: 'status', label: 'Status', widthClassName: 'w-[140px]', align: 'center' },
            ],
            rows: [],
            emptyLabel: 'Belum ada data',
            emptySpaceClassName: DEFAULT_EMPTY_SPACE_CLASS_NAME,
            tableClassName: 'min-w-[1450px]',
            searchKeys: ['date', 'documentNumber', 'transactionType', 'description', 'debit', 'credit', 'status'],
        },
        sidePanel: {
            hidden: true,
        },
    },
};
