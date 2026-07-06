import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

function createSearchControl() {
    return {
        id: 'keyword',
        type: 'search',
        value: '',
        placeholder: 'Cari/Pilih...',
        wrapperClassName: 'w-full sm:w-[280px] md:w-[320px] shrink-0',
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
    createDateControl('startDate', todayDisplayDate),
    {
        type: 'label',
        label: 's/d',
        wrapperClassName: 'px-1 text-center',
    },
    createDateControl('endDate', todayDisplayDate),
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
                { id: 'sourceNumber', label: 'No. Sumber #', widthClassName: 'w-[180px]', align: 'left' },
                { id: 'transactionType', label: 'Tipe Transaksi', widthClassName: 'w-[170px]', align: 'left' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[720px]', align: 'left' },
                { id: 'mutation', label: 'Mutasi', widthClassName: 'w-[150px]', align: 'right' },
                { id: 'type', label: 'Tipe', widthClassName: 'w-[80px]', align: 'center' },
                { id: 'balance', label: 'Saldo', widthClassName: 'w-[160px]', align: 'right' },
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
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[520px]', align: 'left' },
                { id: 'mutation', label: 'Mutasi', widthClassName: 'w-[150px]', align: 'right' },
                { id: 'type', label: 'Tipe', widthClassName: 'w-[80px]', align: 'center' },
                { id: 'balance', label: 'Saldo', widthClassName: 'w-[200px]', align: 'right' },
            ],
            rows: [],
            emptyLabel: 'Belum ada data',
            emptySpaceClassName: DEFAULT_EMPTY_SPACE_CLASS_NAME,
            tableClassName: 'min-w-[1100px]',
            searchKeys: ['date', 'description', 'mutation', 'type', 'balance'],
        },
        sidePanel: {
            hidden: true,
        },
    },
    'bank-history': {
        controls: DEFAULT_CONTROLS,
        actions: [
            createAction('reload', 'link', 'Muat ulang histori bank'),
            createAction('export-excel', 'download', 'Ekspor Excel'),
            createAction('switch-view', 'columns', 'Ubah Tampilan'),
        ],
        table: {
            columns: [
                { id: 'date', label: 'Tanggal', widthClassName: 'w-[110px]', align: 'center' },
                { id: 'sourceNumber', label: 'No. Sumber #', widthClassName: 'w-[160px]', align: 'left' },
                { id: 'checkNumber', label: 'No Cek #', widthClassName: 'w-[130px]', align: 'left' },
                { id: 'transactionType', label: 'Tipe Transaksi', widthClassName: 'w-[180px]', align: 'left' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[700px]', align: 'left' },
                { id: 'mutation', label: 'Mutasi', widthClassName: 'w-[140px]', align: 'right' },
                { id: 'type', label: 'Tipe', widthClassName: 'w-[80px]', align: 'center' },
                { id: 'balance', label: 'Saldo', widthClassName: 'w-[150px]', align: 'right' },
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
                { id: 'documentNumber', label: 'No. Bukti #', widthClassName: 'w-[180px]', align: 'left' },
                { id: 'transactionType', label: 'Tipe Transaksi', widthClassName: 'w-[180px]', align: 'left' },
                { id: 'description', label: 'Keterangan', widthClassName: 'min-w-[560px]', align: 'left' },
                { id: 'debit', label: 'Debit', widthClassName: 'w-[140px]', align: 'right' },
                { id: 'credit', label: 'Kredit', widthClassName: 'w-[140px]', align: 'right' },
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
