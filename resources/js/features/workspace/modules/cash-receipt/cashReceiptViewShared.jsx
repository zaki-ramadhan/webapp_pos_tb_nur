import { buildCurrencyValue, TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    CogIcon,
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

export function buildCashReceiptDetailRecordFromRow(row = {}, config) {
    const amount = row.amount ?? '0';

    return {
        bankAccounts: row.cashBankFull ? [row.cashBankFull] : [],
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        checkNumber: row.checkNumber ?? '',
        payer: row.payer ?? '',
        voided: row.voided ?? false,
        branches: row.branch ? [row.branch] : ['JAKARTA'],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: row.lineItems ?? [
            {
                id: `${row.id}-line-1`,
                accountCode: row.accountCode ?? '811.000-01',
                accountName: row.accountName ?? row.description ?? '',
                amount,
            },
        ],
        totalValue: buildCurrencyValue(amount),
        saveTone: 'muted',
        reconcileStatus: row.reconcileStatus ?? 'Ya',
        reconcileDate: row.reconcileDate ?? '(11/02/2017)',
        printStatus: row.printStatus ?? 'Belum cetak/email',
    };
}

export function buildCashReceiptFormState(source = {}, config) {
    return {
        bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        checkNumber: source.checkNumber ?? config.draft?.checkNumber ?? '',
        payer: source.payer ?? config.draft?.payer ?? '',
        voided: source.voided ?? config.draft?.voided ?? false,
        branches: [...(source.branches ?? config.draft?.branches ?? [])],
        notes: source.notes ?? config.draft?.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? config.draft?.lineItems ?? [])],
        totalValue: source.totalValue ?? config.draft?.totalValue ?? '0',
        saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
        reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
        reconcileDate: source.reconcileDate ?? config.draft?.reconcileDate ?? '',
        printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
    };
}

export function ReceiptFilterBar({ table, filters, setFilters, SelectField }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto shrink-0"
                    className="h-[34px] min-w-[126px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

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

export function CashReceiptSortHeader({ column }) {
    return (
        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}

export function CashReceiptEmptyLineRow({ colSpan, emptyLabel }) {
    return (
        <tr className="bg-white">
            <td className="px-3 text-center text-[#a8afbe]">
                <TableActionIcon className="mx-auto h-4 w-4" />
            </td>
            <td
                colSpan={colSpan - 1}
                className="px-3 py-3 text-center text-[15px] text-[#131a28]"
            >
                {emptyLabel}
            </td>
        </tr>
    );
}
