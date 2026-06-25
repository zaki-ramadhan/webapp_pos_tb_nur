import { useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import SectionTab from '@/features/workspace/shared/SectionTab';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

function buildFallbackDetailRecord(row, config) {
    return {
        documentNumber: row.number,
        transactionNumber: row.transactionNumber,
        date: row.date,
        transactionType: row.typeLabel,
        selectedDisplay: config.displayOptions?.[0] ?? 'Semua Perubahan',
        reviewedAt: `Per ${row.date} 22:56:52 (Aktif)`,
        reviewer: 'Pengguna : TB Nur POS System',
        entries: [
            {
                id: `${row.id}-line-1`,
                accountCode: '111.102-01',
                accountName: 'Bank BCA IDR Jakarta (069-773-3993)',
                debit: row.amount,
                credit: '',
            },
            {
                id: `${row.id}-line-2`,
                accountCode: '112.101-01',
                accountName: 'Piutang Usaha Jakarta - IDR',
                debit: '',
                credit: row.amount,
            },
        ],
        totalDebit: row.amount,
        totalCredit: row.amount,
    };
}

function SummaryField({ label, value, align = 'left' }) {
    return (
        <>
            <div className={`text-xs sm:text-sm text-brand-dark ${align === 'right' ? 'lg:text-right' : ''}`.trim()}>{label}</div>
            <div className="text-xs sm:text-sm text-brand-dark">{value}</div>
        </>
    );
}

function AmountColumn({ label, align = 'right' }) {
    return (
        <div className="px-2 py-2 text-xs sm:text-sm text-brand-dark text-center">
            {label}
        </div>
    );
}

export default function JournalActivityLogDetailView({ config, activeLevel2Tab }) {
    const recordId = activeLevel2Tab?.recordId;
    const row = config.rowMap?.[recordId];
    const detail = config.detailRecords?.[recordId] ?? buildFallbackDetailRecord(row ?? {}, config);
    const [displayOption, setDisplayOption] = useState(detail.selectedDisplay ?? config.displayOptions?.[0] ?? '');

    return (
        <div className="flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={config.sectionLabel} />
            </div>

            <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
                <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
                    <div className="grid gap-y-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <SummaryField label={config.labels.date} value={detail.date} />
                        <SummaryField label={config.labels.transactionType} value={detail.transactionType} />

                        <div className="text-xs sm:text-sm text-brand-dark">{config.labels.display}</div>
                        <SelectField
                            value={displayOption}
                            onChange={(event) => setDisplayOption(event.target.value)}
                            className="h-[34px] max-w-[458px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            {config.displayOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <SummaryField label={config.labels.number} value={detail.documentNumber} />
                        <SummaryField label={config.labels.transactionNumber} value={detail.transactionNumber} />
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-650 bg-tab-inactive-bg">
                    <div className="grid grid-cols-[160px_minmax(0,1fr)_220px_220px]">
                        <AmountColumn label={config.labels.accountCode} align="left" />
                        <AmountColumn label={config.labels.accountName} align="left" />
                        <AmountColumn label={config.labels.debit} />
                        <AmountColumn label={config.labels.credit} />
                    </div>
                </div>

                <div className="px-2 py-2">
                    <div className="text-base font-semibold text-text-darkest">{detail.reviewedAt}</div>
                    <div className="mt-1 text-base text-text-darkest">{detail.reviewer}</div>

                    <div className="mt-4 space-y-3">
                        {detail.entries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-[160px_minmax(0,1fr)_220px_220px] gap-x-3">
                                <div className="text-xs sm:text-sm text-brand-dark">{entry.accountCode}</div>
                                <div className="text-xs sm:text-sm text-brand-dark">{entry.accountName}</div>
                                <div className="text-left text-xs sm:text-sm text-brand-dark">{formatTableTextValue(entry.debit)}</div>
                                <div className="text-left text-xs sm:text-sm text-brand-dark">{formatTableTextValue(entry.credit)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 grid grid-cols-[160px_minmax(0,1fr)_220px_220px] gap-x-3">
                        <div />
                        <div />
                        <div className="pt-1 text-left">
                            <div className="mr-auto h-px w-full max-w-[454px] bg-brand-dark" />
                            <div className="pt-1 text-lg font-semibold text-text-darkest">{detail.totalDebit}</div>
                        </div>
                        <div className="pt-1 text-left">
                            <div className="mr-auto h-px w-full max-w-[454px] bg-brand-dark" />
                            <div className="pt-1 text-lg font-semibold text-text-darkest">{detail.totalCredit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
