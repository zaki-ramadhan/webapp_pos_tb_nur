import React from 'react';
import {
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    DownloadIcon,
    PrintIcon,
    CogIcon,
    PlusIcon,
    LinkIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import { ReceiptFilterBar } from './cashReceiptComponents';

export function cashReceiptToolbarRightControls(config) {
    return (
        <>
            <TransactionToolbarSplitButton label={config.table.downloadLabel} icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
            <TransactionToolbarIconButton label={config.table.printLabel}>
                <PrintIcon className="h-4 w-4" />
            </TransactionToolbarIconButton>
            <TransactionToolbarSplitButton label={config.table.settingsLabel} icon={<CogIcon className="h-4 w-4" />} items={config.table.settingsItems} />
        </>
    );
}

export function cashReceiptToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters, SelectField) {
    return {
        size: 'compact',
        className: 'space-y-3',
        filters: <ReceiptFilterBar table={config.table} filters={filters} setFilters={setFilters} SelectField={SelectField} />,
        createButton: { label: config.table.createLabel, onClick: onCreate, icon: <PlusIcon className="h-6 w-6" /> },
        refreshButton: { label: config.table.refreshLabel, icon: <LinkIcon className="h-4.5 w-4.5" /> },
        rightControls: cashReceiptToolbarRightControls(config),
        search: {
            value: keyword,
            onChange: (event) => setKeyword(event.target.value),
            placeholder: config.table.searchPlaceholder,
            widthClassName: 'sm:w-[342px]',
            trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
        },
        pageValue: config.table.pageValue,
    };
}
