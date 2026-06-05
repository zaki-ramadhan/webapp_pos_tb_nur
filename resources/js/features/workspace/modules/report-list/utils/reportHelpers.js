import { buildReportListConfig as buildBackendReportListConfig } from '@/features/workspace/backend/workspaceBackendAdapters';

export function buildResolvedReportConfig(rows, fallbackConfig) {
    if (rows.length) {
        return buildBackendReportListConfig(rows, fallbackConfig);
    }

    return {
        ...fallbackConfig,
        reports: [],
    };
}

export function buildReportContentState({ loading, error, reportsCount, visibleSectionsCount, keyword, config }) {
    if (loading) {
        return {
            title: 'Memuat daftar laporan',
            description: 'Daftar laporan sedang diambil dari server.',
            iconName: 'reports',
            hasAction: false,
        };
    }

    if (error) {
        return {
            title: 'Gagal memuat daftar laporan',
            description: typeof error === 'string' && error.includes('Conflict')
                ? 'Terjadi bentrokan data di database server.'
                : 'Tidak dapat terhubung ke server atau terjadi kendala sistem saat memuat data.',
            iconName: 'document',
            hasAction: true,
        };
    }

    if (reportsCount === 0) {
        return {
            title: 'Belum ada laporan',
            description: 'Data daftar laporan belum tersedia dari backend.',
            iconName: 'reports',
            hasAction: false,
        };
    }

    if (visibleSectionsCount === 0) {
        return {
            title: config.emptyState.title,
            description: keyword
                ? config.emptyState.description
                : 'Belum ada laporan pada kategori yang dipilih.',
            iconName: keyword ? 'search' : 'reports',
            hasAction: false,
        };
    }

    return null;
}

export function getIconStyles(iconType) {
    if (iconType === 'reports' || iconType === 'budget' || iconType === 'chart') {
        return {
            color: 'text-[#ea580c]',
            icon: 'reports',
        };
    }
    
    if (iconType === 'activity' || iconType === 'document' || iconType === 'invoice' || iconType === 'info') {
        return {
            color: 'text-[#2269bb]',
            icon: iconType,
        };
    }
    
    return {
        color: 'text-[#7c3aed]',
        icon: iconType === 'save' ? 'save' : 'ledger',
    };
}

export function buildVisibleSections(reports, activeCategoryId, keyword) {
    const filteredReports = reports.filter((report) => {
        if (report.categoryId !== activeCategoryId) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        return [report.title, report.description, report.section].some((value) =>
            String(value ?? '')
                .toLowerCase()
                .includes(keyword),
        );
    });

    return filteredReports.reduce((result, report) => {
        const currentSection = result.find((section) => section.title === report.section);

        if (currentSection) {
            currentSection.items.push(report);
            return result;
        }

        result.push({
            title: report.section,
            items: [report],
        });

        return result;
    }, []);
}

const reportParamsOverride = {
    'finance-profit-loss': {
        dateType: 'period',
        hasBranch: true,
        checkboxes: ['totalOnly', 'showParentAccount', 'showChildAccount', 'showZeroBalance', 'showParentBalance']
    },
    'finance-balance-sheet': {
        dateType: 'single',
        hasBranch: true,
        checkboxes: ['totalOnly', 'showParentAccount', 'showChildAccount', 'showZeroBalance', 'showParentBalance']
    },
    'finance-cashflow': {
        dateType: 'period',
        hasBranch: true,
        checkboxes: ['totalOnly']
    },
    'receivable-aging': {
        dateType: 'single',
        hasBranch: true,
        checkboxes: ['totalOnly']
    },
    'receivable-outstanding': {
        dateType: 'single',
        hasBranch: true,
        checkboxes: ['totalOnly']
    },
    'payable-aging': {
        dateType: 'single',
        hasBranch: true,
        checkboxes: ['totalOnly']
    },
    'warehouse-stock-value': {
        dateType: 'single',
        hasBranch: true,
        checkboxes: ['totalOnly', 'showZeroBalance']
    },
    'sales-monthly-chart': {
        dateType: 'period',
        hasBranch: true,
        checkboxes: []
    }
};

export function resolveReportParams(reportId, categoryId) {
    if (reportParamsOverride[reportId]) {
        return reportParamsOverride[reportId];
    }

    // Default heuristic rules:
    let dateType = 'range';
    let hasBranch = true;
    let checkboxes = ['totalOnly'];

    const id = String(reportId || '').toLowerCase();
    
    if (
        id.includes('aging') || 
        id.includes('outstanding') || 
        id.includes('balance-sheet') || 
        id.includes('stock-value') || 
        id.includes('stock-card') ||
        id.includes('target')
    ) {
        dateType = 'single';
    } else if (
        id.includes('profit-loss') || 
        id.includes('cashflow') || 
        id.includes('monthly-chart') || 
        id.includes('summary') || 
        id.includes('distribution') ||
        id.includes('performance')
    ) {
        dateType = 'period';
    }

    if (categoryId === 'memorize') {
        checkboxes = ['totalOnly'];
    }

    return {
        dateType,
        hasBranch,
        checkboxes
    };
}

export function resolveReportColumns(reportId, categoryId) {
    const id = String(reportId || '').toLowerCase();
    const cat = String(categoryId || '').toLowerCase();

    if (cat === 'sales') {
        return {
            mandatory: [
                { id: 'date', label: 'Tanggal Penjualan' },
                { id: 'docNo', label: 'Nomor Penjualan' },
                { id: 'customer', label: 'Pelanggan' },
                { id: 'item', label: 'Nama Barang' },
                { id: 'qty', label: 'Kuantitas' },
                { id: 'price', label: 'Harga Satuan' },
                { id: 'total', label: 'Total Penjualan' }
            ],
            optional: [
                { id: 'brand', label: 'Merek Barang' },
                { id: 'warehouse', label: 'Gudang Penyimpanan' },
                { id: 'salesperson', label: 'Tenaga Penjual (Sales)' },
                { id: 'discount', label: 'Diskon per Barang' },
                { id: 'currency', label: 'Mata Uang' },
                { id: 'rate', label: 'Kurs Konversi' },
                { id: 'notes', label: 'Catatan Transaksi' }
            ]
        };
    }

    if (cat === 'ledger' || id.includes('journal')) {
        return {
            mandatory: [
                { id: 'date', label: 'Tanggal Transaksi' },
                { id: 'docNo', label: 'Nomor Jurnal' },
                { id: 'notes', label: 'Keterangan Transaksi' },
                { id: 'debit', label: 'Mutasi Debit' },
                { id: 'credit', label: 'Mutasi Kredit' },
                { id: 'balance', label: 'Saldo Berjalan' }
            ],
            optional: [
                { id: 'accountNo', label: 'Nomor Akun Perkiraan' },
                { id: 'accountName', label: 'Nama Akun Perkiraan' },
                { id: 'branch', label: 'Cabang Transaksi' },
                { id: 'partner', label: 'Kontak / Partner Bisnis' },
                { id: 'status', label: 'Status Verifikasi (Approval)' }
            ]
        };
    }

    if (cat === 'cash-bank') {
        return {
            mandatory: [
                { id: 'date', label: 'Tanggal Mutasi' },
                { id: 'docNo', label: 'Nomor Referensi Bank' },
                { id: 'payee', label: 'Penerima / Pembayar' },
                { id: 'debit', label: 'Kas Masuk' },
                { id: 'credit', label: 'Kas Keluar' },
                { id: 'balance', label: 'Saldo Kas & Bank' }
            ],
            optional: [
                { id: 'paymentMethod', label: 'Metode Pembayaran' },
                { id: 'branch', label: 'Cabang Operasional' },
                { id: 'notes', label: 'Keterangan Tambahan' },
                { id: 'currency', label: 'Mata Uang Asing' },
                { id: 'rate', label: 'Nilai Kurs' }
            ]
        };
    }

    if (cat === 'finance' || id.includes('profit-loss') || id.includes('balance-sheet')) {
        return {
            mandatory: [
                { id: 'accountNo', label: 'Nomor Akun' },
                { id: 'accountName', label: 'Nama Akun Keuangan' },
                { id: 'opening', label: 'Saldo Awal' },
                { id: 'debit', label: 'Mutasi Debit' },
                { id: 'credit', label: 'Mutasi Kredit' },
                { id: 'closing', label: 'Saldo Akhir' }
            ],
            optional: [
                { id: 'department', label: 'Departemen Terkait' },
                { id: 'project', label: 'Proyek Bisnis' },
                { id: 'branch', label: 'Cabang Laporan' },
                { id: 'currency', label: 'Mata Uang Transaksi' }
            ]
        };
    }

    if (cat === 'inventory' || cat === 'warehouse') {
        return {
            mandatory: [
                { id: 'itemCode', label: 'Kode Barang / SKU' },
                { id: 'itemName', label: 'Nama Barang' },
                { id: 'unit', label: 'Satuan Pengukuran' },
                { id: 'qtyOpening', label: 'Stok Awal' },
                { id: 'qtyIn', label: 'Stok Masuk' },
                { id: 'qtyOut', label: 'Stok Keluar' },
                { id: 'qtyClosing', label: 'Stok Akhir' }
            ],
            optional: [
                { id: 'warehouse', label: 'Gudang Lokasi' },
                { id: 'brand', label: 'Merek' },
                { id: 'category', label: 'Kategori Barang' },
                { id: 'stockValue', label: 'Nilai Stok Rata-rata' },
                { id: 'cogs', label: 'Harga Pokok Penjualan (HPP)' }
            ]
        };
    }

    // Default Fallback
    return {
        mandatory: [
            { id: 'date', label: 'Tanggal / Periode' },
            { id: 'docNo', label: 'Nomor Dokumen' },
            { id: 'notes', label: 'Keterangan' },
            { id: 'amount', label: 'Nominal / Nilai' },
            { id: 'branch', label: 'Cabang' },
            { id: 'account', label: 'Akun Terkait' }
        ],
        optional: [
            { id: 'currency', label: 'Mata Uang' },
            { id: 'creator', label: 'User Pembuat' },
            { id: 'dept', label: 'Departemen' },
            { id: 'status', label: 'Status Verifikasi' },
            { id: 'extra', label: 'Catatan Tambahan' }
        ]
    };
}

