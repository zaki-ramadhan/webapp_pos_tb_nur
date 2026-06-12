import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import SelectField from '@/components/ui/SelectField';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { LinkIcon, SortIcon } from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

export function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField value={value} onChange={(event) => onChange(filter.id, event.target.value)} containerClassName="w-auto" className="h-[40px] min-w-[118px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
            {filter.options.map((option) => <option key={option.value} value={option.value}>{filter.label}: {option.label}</option>)}
        </SelectField>
    );
}

function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

export function StockOpnameOrderHeader({ config, values, isDetail }) {
    return (
        <SectionCard>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="grid gap-4 sm:max-w-[420px]">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.date} />
                        <TransactionDateInput value={values.date} className="w-full max-w-[296px]" />
                    </div>
                    {isDetail ? (
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.status} />
                            <TextInput value={values.status} readOnly className="h-[40px] max-w-[420px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#4b5565]" />
                        </div>
                    ) : null}
                </div>
                <div className="grid gap-2 xl:justify-self-end xl:min-w-[420px]">
                    <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
                        <TransactionFieldLabel label={config.labels.number} required />
                        <TransactionSwitch checked={values.autoNumber} onChange={() => {}} />
                        {values.autoNumber && !isDetail ? (
                            <SelectField value={values.numberingType} containerClassName="w-full xl:w-[350px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                                {config.numberingOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </SelectField>
                        ) : (
                            <TextInput value={values.number} readOnly trailing={isDetail ? <span className="text-2xl font-semibold text-[#1f2436]">x</span> : null} className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] xl:w-[420px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" trailingClassName="px-3" />
                        )}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

export function StockOpnameOrderInfoSection({ config, values, isDetail }) {
    return (
        <SectionCard className="min-h-[620px]">
            <h3 className="border-b border-[#d8dde7] pb-4 text-2xl font-normal text-[#111827]">{config.infoSectionTitle}</h3>
            <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:gap-x-9">
                <div className="space-y-3">
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.branch} required={!isDetail} /><ChipLookupField values={values.branches} placeholder="Cari/Pilih..." searchLabel="Cari cabang" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.department} /><ChipLookupField values={values.department} placeholder="Cari/Pilih..." searchLabel="Cari departemen" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.startDate} required /><TransactionDateInput value={values.startDate} className="w-full max-w-[348px]" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.responsiblePerson} required /><TextInput value={values.responsiblePerson} readOnly trailing={isDetail ? <span className="text-2xl font-semibold text-[#1f2436]">x</span> : null} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" trailingClassName="px-3" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.workers} required /><ChipLookupField values={values.workers} placeholder="Cari/Pilih..." searchLabel="Cari petugas" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.notes} /><TextareaField value={values.notes} readOnly rows={5} className="rounded-[4px] border-[#cfd6e2]" textareaClassName="min-h-[100px] text-xs sm:text-sm text-[#1f2436]" /></div>
                </div>
                <div className="space-y-3">
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.warehouse} required /><ChipLookupField values={values.warehouse} placeholder="Cari/Pilih..." searchLabel="Cari gudang" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.category} /><ChipLookupField values={values.category} placeholder="Cari/Pilih..." searchLabel="Cari kategori barang" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.supplier} /><ChipLookupField values={values.supplier} placeholder="Cari/Pilih..." searchLabel="Cari pemasok barang" /></div>
                    <div className="grid gap-2"><TransactionFieldLabel label={config.labels.brand} /><ChipLookupField values={values.brand} placeholder="Cari/Pilih..." searchLabel="Cari merek barang" /></div>
                </div>
            </div>
        </SectionCard>
    );
}

function ProcessSummaryCard({ rows }) {
    return (
        <div className="rounded-[6px] border border-[#d6dce8] bg-white">
            {rows.map((row) => (
                <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4e8ef] px-4 py-3 last:border-b-0">
                    <div className="text-xs sm:text-sm text-[#1f2436]">{row.label}</div>
                    <div className={`text-right text-base ${row.tone === 'link' ? 'font-semibold text-[#28b565]' : 'text-[#1f2436]'}`.trim()}>{row.value}</div>
                </div>
            ))}
        </div>
    );
}

function ProcessHistoryCard({ rows }) {
    return (
        <div className="space-y-3">
            {rows.map((row) => (
                <div key={row.id} className="rounded-[6px] border border-[#d6dce8] bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-medium text-[#1564d7]">{row.number}</div>
                            <div className="mt-1 text-sm text-[#3d4659]">{row.date}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-medium text-[#1f2436]">{row.itemCount}</div>
                            <div className="mt-1 text-sm text-[#3d4659]">{row.worker}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function StockOpnameOrderProcessSection({ values }) {
    return (
        <SectionCard className="min-h-[620px]">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] xl:gap-x-9">
                <div>
                    <h3 className="text-2xl font-normal text-[#111827]">Informasi Proses Stok Opname</h3>
                    <div className="mt-4"><ProcessSummaryCard rows={values.processSummaryRows} /></div>
                </div>
                <div>
                    <h3 className="text-2xl font-normal text-[#111827]">Riwayat Hasil Stok Opname</h3>
                    <div className="mt-4"><ProcessHistoryCard rows={values.processHistoryRows} /></div>
                </div>
            </div>
        </SectionCard>
    );
}

export function StockOpnameOrderTableRows({ config, rows, onOpenDetail }) {
    return (
        <TransactionDataTable
            columns={config.table.columns}
            rows={rows}
            emptyLabel="Belum ada data"
            minWidthClassName="min-w-[1460px]"
            onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
            getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
            renderHeaderCell={(column) => (
                <span className="flex items-center gap-2">
                    <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                    <span>{column.label}</span>
                </span>
            )}
            renderCell={({ row, column }) => <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
        />
    );
}
