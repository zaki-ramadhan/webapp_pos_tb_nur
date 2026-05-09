import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { buildSalesDepositConfig, buildSalesDepositRecord } from '@/features/workspace/modules/salesDepositConfig';
import {
    ReadonlyTransactionTextarea,
    buildDepositFormState,
} from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CircleCheckIcon,
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PinIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function DepositStamp({ label, tone = 'blue', className = '' }) {
    const toneClassName =
        tone === 'gray'
            ? 'border-[#bebfc8] text-[#b8bac3]'
            : tone === 'green'
              ? 'border-[#8bd987] text-[#8ccc81]'
              : 'border-[#7fd1ff] text-[#7dcaf4]';

    return (
        <div
            className={`pointer-events-none absolute flex h-[98px] w-[144px] rotate-[-18deg] items-center justify-center opacity-55 ${className}`.trim()}
        >
            <div className={`relative flex h-[82px] w-[82px] items-center justify-center rounded-full border-[4px] ${toneClassName}`.trim()}>
                <div className={`absolute h-[96px] w-[96px] rounded-full border-[2px] ${toneClassName}`.trim()} />
            </div>
            <div
                className={`absolute whitespace-pre-line rounded-[3px] border-[3px] bg-white px-3 py-1 text-center text-[14px] font-bold leading-[1.05] tracking-[0.12em] ${toneClassName}`.trim()}
            >
                {label}
            </div>
        </div>
    );
}

function DepositStatusPill({ value }) {
    const toneClassName =
        value === 'Lunas'
            ? 'border-[#bcebc1] bg-[#effcf0] text-[#2db757]'
            : 'border-[#ffd08c] bg-[#fff5e7] text-[#ff8d08]';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-1 text-[15px] ${toneClassName}`.trim()}>
            {value}
        </span>
    );
}

function DepositFooter({ values }) {
    return (
        <TransactionDualTotalCard
            items={[
                { label: 'Sub Total', value: values.subtotal },
                { label: 'Total', value: values.total },
            ]}
        />
    );
}

function DepositAmountField({ value }) {
    return (
        <div className="flex h-[34px] overflow-hidden rounded-[4px] border border-[#cfd6e2]">
            <span className="inline-flex items-center border-r border-[#d8dde7] bg-[#f5f6f8] px-3 text-[15px] text-[#9aa3b1]">Rp</span>
            <span className="inline-flex flex-1 items-center justify-end px-3 text-[18px] font-semibold text-[#111827]">{value}</span>
            <span className="inline-flex w-10 items-center justify-center border-l border-[#d8dde7] text-[#1f2436]">
                <TableActionIcon className="h-4 w-4" />
            </span>
        </div>
    );
}

function DepositInfoSection({ config, values, isDetail }) {
    return (
        <section>
            <TransactionSectionHeading title={config.infoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.paymentTerms} />
                <ChipLookupField values={values.paymentTerms} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari syarat pembayaran" heightClassName="h-[34px]" />

                <TransactionFieldLabel label={config.labels.address} />
                {isDetail ? (
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                            aria-label="Lihat alamat"
                        >
                            <PinIcon className="h-[18px] w-[18px] text-[#21539b]" />
                        </button>
                        <ReadonlyTransactionTextarea value={values.address} className="min-h-[86px] flex-1" />
                    </div>
                ) : (
                    <ReadonlyTransactionTextarea value={values.address} className="min-h-[84px]" />
                )}

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari cabang" heightClassName="h-[34px]" />

                <TransactionFieldLabel label={config.labels.notes} />
                <ReadonlyTransactionTextarea value={values.notes} className="min-h-[72px]" />
            </div>
        </section>
    );
}

function DepositSmartlinkSection({ config }) {
    return (
        <section>
            <TransactionSectionHeading title={config.smartlinkTitle} icon="smartlink" />
            <div className="mt-4 flex items-start gap-4 text-[17px] leading-8 text-[#1f2436]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#1f2436]">
                    i
                </span>
                <p className="max-w-[720px] italic">
                    Sekarang Anda dapat menerima pembayaran tagihan ini melalui partner Payment Gateway
                    <br />
                    kami. <span className="text-[#1564d7]">Klik Disini</span>
                </p>
            </div>
        </section>
    );
}

function DepositSummarySection({ config, values }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            <section className="rounded-[4px] border border-[#d2d8e3] bg-white">
                <div className="border-b border-[#d8dde7] px-4 py-3">
                    <TransactionSectionHeading title={config.summaryTitle} icon="payment" />
                </div>
                <div className="-mt-3 pb-1 pt-2">
                    {values.summary.map(([label, value]) => (
                        label === 'Status' ? (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6ebf2] px-4 py-2.5">
                                <span className="text-[17px] text-[#1f2436]">{label}</span>
                                <DepositStatusPill value={value} />
                            </div>
                        ) : (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6ebf2] px-4 py-2.5 last:border-b-0">
                                <span className="text-[17px] text-[#1f2436]">{label}</span>
                                <span className={`text-right text-[17px] ${label === 'Dicetak/email' ? 'font-semibold text-[#111827]' : 'text-[#111827]'}`.trim()}>
                                    {value}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </section>

            <section className="rounded-[4px] border border-[#d2d8e3] bg-white">
                <div className="border-b border-[#d8dde7] px-4 py-3">
                    <TransactionSectionHeading title={config.usedDepositTitle} icon="payment" />
                </div>
                <div className="px-4 py-4">
                    {values.usedDepositRows.length ? (
                        <div className="rounded-[4px] border border-[#d8dde7] bg-white">
                            {values.usedDepositRows.map((item, index) => (
                                <div key={item.id} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 ${index > 0 ? 'border-t border-[#e6ebf2]' : ''}`.trim()}>
                                    <div>
                                        <div className="text-[17px] font-semibold text-[#1661d8]">{item.number}</div>
                                        <div className="mt-1 text-[14px] text-[#1f2436]">{item.date}</div>
                                    </div>
                                    <div className="text-right text-[17px] font-semibold text-[#111827]">{item.amount}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[4px] border border-dashed border-[#d8dde7] px-4 py-6 text-[15px] text-[#7d879a]">
                            Belum ada data.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function SalesDepositFormView({ config, buildRecord, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'deposit');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () => (activeRecordId ? buildRecord(config.table.rows.find((row) => row.id === activeRecordId)) : config.draft),
        [activeRecordId, buildRecord, config.draft, config.table.rows],
    );
    const [values, setValues] = useState(() => buildDepositFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'deposit');
        setValues(buildDepositFormState(sourceRecord));
    }, [config.sectionTabs, sourceRecord]);

    return (
        <TransactionFormLayout
            header={
                <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                    <div className={`grid gap-y-3 ${isDetail ? 'sm:grid-cols-[170px_minmax(0,1fr)_180px]' : 'sm:grid-cols-[170px_minmax(0,1fr)]'} sm:items-center sm:gap-x-4`.trim()}>
                        <TransactionFieldLabel label={config.labels.customer} required />
                        <ChipLookupField values={values.customer} placeholder="Cari/Pilih Pelanggan..." onRemove={() => {}} searchLabel="Cari pelanggan" />
                        {isDetail ? (
                            <div className="max-w-[180px]">
                                <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
                            </div>
                        ) : null}

                        <TransactionFieldLabel label={config.labels.entryDate} required />
                        <TransactionDateInput value={values.entryDate} />
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center justify-start gap-4 sm:justify-end">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                            {!isDetail ? (
                                <TransactionSwitch checked={values.autoNumber} onChange={(nextValue) => setValues((current) => ({ ...current, autoNumber: nextValue }))} />
                            ) : null}
                        </div>

                        {!isDetail && values.autoNumber ? (
                            <SelectField value={values.numberingType} onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[18px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        )}

                        <div />
                        {isDetail && values.processButtonLabel ? (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                                >
                                    {values.processButtonLabel}
                                    <span className="ml-1">⌄</span>
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<DepositFooter values={values} />}
            dockActions={values.dockActions}
        >
            <div className="relative">
                {isDetail && values.approvalStamp ? <DepositStamp label={values.approvalStamp} tone="blue" className="right-[12%] top-[-8px]" /> : null}
                {isDetail && values.statusStamp ? <DepositStamp label={values.statusStamp} tone={values.statusTone} className={activeSectionId === 'invoice-info' ? 'left-[49%] top-[37%]' : 'left-[49%] top-[33%]'} /> : null}

                {activeSectionId === 'additional-info' ? (
                    <DepositInfoSection config={config} values={values} isDetail={isDetail} />
                ) : activeSectionId === 'smartlink' ? (
                    <DepositSmartlinkSection config={config} />
                ) : activeSectionId === 'invoice-info' ? (
                    <DepositSummarySection config={config} values={values} />
                ) : (
                    <section>
                        <TransactionSectionHeading title={config.depositTitle} icon="payment" />

                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.depositAmount} required />
                            <DepositAmountField value={values.depositAmount} />

                            <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                            <TextInput value={values.purchaseOrderNumber} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                            <TransactionFieldLabel label={config.labels.tax} />
                            <div className="flex flex-wrap gap-8 text-[17px] text-[#1f2436]">
                                <label className="inline-flex items-center gap-3">
                                    <input type="checkbox" checked={values.taxEnabled} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                    <span>Kena Pajak</span>
                                </label>
                                <label className="inline-flex items-center gap-3">
                                    <input type="checkbox" checked={values.taxIncluded} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                    <span>Total termasuk Pajak</span>
                                </label>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </TransactionFormLayout>
    );
}

function SalesDepositFilterBar({ config, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {config.table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={config.table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

function SalesDepositTableView({ config, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];
                return !selectedValue || selectedValue === 'all' ? true : row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.number, row.date, row.customer, row.notes, row.status, row.total].some((value) =>
                String(value ?? '').toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={<SalesDepositFilterBar config={config} filters={filters} setFilters={setFilters} />}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton label="Unduh" icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
                        <TransactionToolbarSplitButton label="Cetak" icon={<PrintIcon className="h-4 w-4" />} items={config.table.printItems} />
                        <TransactionToolbarSplitButton label="Pengaturan tabel" icon={<NavigationIcon type="settings" className="h-4 w-4" />} items={config.table.settingsItems} />
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1480px]"
                    onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) =>
                        column.id === 'statusIcon' ? (
                            <span className="inline-flex items-center justify-center text-[#27b35f]">
                                <CircleCheckIcon className="h-5.5 w-5.5 text-[#27b35f]" />
                            </span>
                        ) : (
                            <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                        )
                    }
                />
            </div>
        </div>
    );
}

export default function SalesDepositView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildSalesDepositConfig(page.salesDeposit), [page.salesDeposit]);

    return mode === 'table' ? (
        <SalesDepositTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesDepositFormView config={config} buildRecord={buildSalesDepositRecord} activeLevel2Tab={activeLevel2Tab} />
    );
}
