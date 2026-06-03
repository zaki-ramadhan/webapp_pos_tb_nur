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

