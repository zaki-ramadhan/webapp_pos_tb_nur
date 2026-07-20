import { buildSalesReturnConfig } from '@/features/workspace/modules/sales-document/salesReturnConfig';

const TRANSACTION_TOP_ACTIONS = [
    {
        id: 'settings',
        label: 'Pengaturan',
        icon: 'settings',
        tone: 'outline',
    },
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

const HELP_ONLY_TOP_ACTION = [
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

const workspacePageOverrides = {
    'sales-return': {
        subtab: {
            id: 'sales-return-create',
            label: 'Data Baru',
        },
        viewModes: {
            form: 'Form',
            table: 'Tabel',
        },
        salesReturn: {
            ...buildSalesReturnConfig(),
            topActions: TRANSACTION_TOP_ACTIONS,
        },
    },
    suppliers: {
        subtab: {
            id: 'suppliers-create',
            label: 'Data Baru',
        },
        viewModes: {
            form: 'Form',
            table: 'Tabel',
        },
        suppliers: {
            topActions: HELP_ONLY_TOP_ACTION,
        },
    },
};

export default function mergeWorkspacePageConfigs(pageMap) {
    return Object.fromEntries(
        Object.entries(pageMap).map(([pageId, page]) => [
            pageId,
            {
                ...page,
                ...(workspacePageOverrides[pageId] ?? {}),
            },
        ]),
    );
}
