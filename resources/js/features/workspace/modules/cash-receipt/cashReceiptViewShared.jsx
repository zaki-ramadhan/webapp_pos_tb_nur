import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { buildCurrencyValue, TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
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

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? record?.accountCode ?? '').trim();
    const name = String(record?.name ?? record?.accountName ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildCashReceiptTotal(lineItems = []) {
    return lineItems.reduce((sum, item) => sum + parseNumericInput(item.amount), 0);
}

function buildFilterOptions(labelPrefix, rows, rowKey, labelKey = rowKey) {
    const values = [...new Set(rows.map((row) => row[rowKey]).filter(Boolean))];

    return [
        { value: 'all', label: `${labelPrefix}: Semua` },
        ...values.map((value) => ({
            value,
            label: `${labelPrefix}: ${rows.find((row) => row[rowKey] === value)?.[labelKey] ?? value}`,
        })),
    ];
}

export function applyCashReceiptLineItems(values, lineItems) {
    const totalAmount = buildCashReceiptTotal(lineItems);

    return {
        ...values,
        lineItems,
        totalValue: `Rp ${formatCurrencyValue(totalAmount)}`,
    };
}

export function buildCashReceiptFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return {
                ...filter,
                rowKey: 'dateFilter',
                options: buildFilterOptions('Tanggal', rows, 'dateFilter'),
            };
        }

        if (filter.id === 'bank') {
            return {
                ...filter,
                rowKey: 'bankFilter',
                options: buildFilterOptions('Kas/Bank', rows, 'bankFilter'),
            };
        }

        return filter;
    });
}

export function buildCashReceiptRow(record) {
    const primaryAccountLabel = buildLookupLabel(record?.primaryAccount ?? {}, 'code');
    const bankLabel = record?.metadata?.cash_bank_label ?? primaryAccountLabel;
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const entryDate = formatIsoDate(record?.entry_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        date: entryDate,
        cashBank: bankLabel,
        cashBankFull: bankLabel,
        checkNumber: record?.metadata?.check_number ?? '',
        description: record?.notes ?? '',
        amount: formatCurrencyValue(totalAmount),
        dateFilter: entryDate,
        bankFilter: bankLabel,
        branch: record?.branch?.name ?? record?.metadata?.branch_label ?? '',
        payer: record?.metadata?.payer ?? '',
    };
}

export function buildCashReceiptRecord(record = {}, config) {
    const lineItems = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index + 1}`),
        __lineId: line.id ?? null,
        __accountId: line.account_id ?? null,
        accountCode: line.account?.code ?? line.reference_code ?? '',
        accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
        amount: formatCurrencyValue(line.total_amount ?? 0),
    }));
    const primaryAccountLabel = buildLookupLabel(record.primaryAccount ?? {}, 'code');
    const bankLabel = record.metadata?.cash_bank_label ?? primaryAccountLabel;

    return applyCashReceiptLineItems(
        {
            __backendRecordId: record.id ?? null,
            __primaryAccountId: record.primary_account_id ?? null,
            __branchId: record.branch_id ?? null,
            bankAccounts: bankLabel ? [bankLabel] : [],
            entryDate: formatIsoDate(record.entry_date),
            autoNumber: false,
            numberingType: record.numbering_type ?? config.numberingOptions?.[0] ?? '',
            documentNumber: record.document_number ?? '',
            checkNumber: record.metadata?.check_number ?? '',
            payer: record.metadata?.payer ?? '',
            voided: Boolean(record.flags?.voided),
            branches: record.branch?.name ? [record.branch.name] : (record.metadata?.branch_label ? [record.metadata.branch_label] : []),
            notes: record.notes ?? '',
            lineLookup: '',
            saveTone: 'muted',
            reconcileStatus: record.metadata?.reconcile_status ?? '',
            reconcileDate: record.metadata?.reconcile_date ?? '',
            printStatus: record.metadata?.print_status ?? '',
        },
        lineItems,
    );
}

export function buildCashReceiptDetailRecordFromRow(row = {}, config) {
    if (row.__backendRecord) {
        return buildCashReceiptRecord(row.__backendRecord, config);
    }

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
        __primaryAccountId: null,
        __branchId: null,
        branches: row.branch ? [row.branch] : ['JAKARTA'],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: row.lineItems ?? [
            {
                id: `${row.id}-line-1`,
                __lineId: null,
                __accountId: null,
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
    return applyCashReceiptLineItems(
        {
            __backendRecordId: source.__backendRecordId ?? null,
            __primaryAccountId: source.__primaryAccountId ?? null,
            __branchId: source.__branchId ?? null,
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
            saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
            reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
            reconcileDate: source.reconcileDate ?? config.draft?.reconcileDate ?? '',
            printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
        },
        [...(source.lineItems ?? config.draft?.lineItems ?? [])],
    );
}

export function buildGeneratedCashReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `CR.${year}.${month}.${day}.${time}`;
}

export function buildCashReceiptPayload(values) {
    const lineItems = (values.lineItems ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        account_id: item.__accountId ?? null,
        description: item.accountName?.trim() || null,
        reference_code: item.accountCode?.trim() || null,
        total_amount: parseNumericInput(item.amount),
        sort_order: index,
    }));
    const totalAmount = buildCashReceiptTotal(values.lineItems ?? []);

    return {
        branch_id: values.__branchId ?? null,
        primary_account_id: values.__primaryAccountId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedCashReceiptNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.bankAccounts?.[0] ?? values.numberingType?.trim() ?? null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            cash_bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            check_number: values.checkNumber?.trim() || null,
            payer: values.payer?.trim() || null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            reconcile_date: values.reconcileDate?.trim() || null,
            print_status: values.printStatus?.trim() || null,
        },
        lines: lineItems.filter(
            (item) => item.account_id || item.description || item.reference_code || item.total_amount > 0,
        ),
    };
}

export function validateCashReceiptValues(values, config) {
    const requiredMessage = [
        { label: config.labels.cashBank, value: values.bankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.branches, type: 'array' },
        { label: config.lineSectionTitle, value: values.lineItems, type: 'array' },
    ];

    for (const check of requiredMessage) {
        if (check.type === 'array') {
            if (!Array.isArray(check.value) || check.value.length < 1) {
                return `${check.label} wajib diisi.`;
            }
        } else if (!String(check.value ?? '').trim()) {
            return `${check.label} wajib diisi.`;
        }
    }

    const invalidLine = (values.lineItems ?? []).find(
        (item) =>
            !String(item.accountName ?? item.accountCode ?? '').trim()
            || parseNumericInput(item.amount) <= 0,
    );

    if (invalidLine) {
        return 'Setiap rincian penerimaan wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}

export function promptCashReceiptLineItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const amountValue = window.prompt(`Nilai penerimaan untuk ${label}`, currentItem?.amount ?? '0');

    if (amountValue === null) {
        return null;
    }

    const amount = parseNumericInput(amountValue);

    if (amount <= 0) {
        throw new Error('Nilai penerimaan harus lebih dari 0.');
    }

    return {
        id: currentItem?.id ?? `draft-line-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __accountId: record?.id ?? currentItem?.__accountId ?? null,
        accountCode: record?.code ?? currentItem?.accountCode ?? '',
        accountName: record?.name ?? currentItem?.accountName ?? '',
        amount: formatCurrencyValue(amount),
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
