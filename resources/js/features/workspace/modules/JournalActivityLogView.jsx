import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapJournalActivityRows } from '@/features/workspace/backend/workspaceBackendAdapters';
import SectionTab from '@/features/workspace/shared/SectionTab';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, LinkIcon, SearchIcon } from '@/features/workspace/shared/Icons';

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

function JournalActivityLogTableView({ config, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return config.table.rows;
        }

        return config.table.rows.filter((row) =>
            [row.date, row.number, row.transactionNumber, row.typeLabel].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            ),
        );
    }, [config.table.rows, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                    onClick: config.table.onRefresh,
                }}
                menuButton={{
                    label: config.table.settingsLabel,
                    icon: <CogIcon className="h-4 w-4" />,
                    items: config.table.menuItems,
                    widthClassName: 'w-[190px]',
                }}
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
                <DataTable className="min-w-[1380px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${
                                        column.align === 'right' ? 'text-right' : 'text-center'
                                    }`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${
                                        index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                    }`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.number,
                                            tabLabel: row.number,
                                        })
                                    }
                                >
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.date)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.number)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.transactionNumber)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.typeLabel)}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.table.columns.length} className="px-2.5 py-3 text-center text-[15px] text-[#131a28]">
                                    {config.table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function SummaryField({ label, value, align = 'left' }) {
    return (
        <>
            <div className={`text-[17px] text-[#1f2436] ${align === 'right' ? 'lg:text-right' : ''}`.trim()}>{label}</div>
            <div className="text-[17px] text-[#1f2436]">{value}</div>
        </>
    );
}

function AmountColumn({ label, align = 'right' }) {
    return (
        <div className={`px-2 py-2 text-[17px] text-[#1f2436] ${align === 'right' ? 'text-right' : 'text-left'}`.trim()}>
            {label}
        </div>
    );
}

function JournalActivityLogDetailView({ config, activeLevel2Tab }) {
    const recordId = activeLevel2Tab?.recordId;
    const row = config.rowMap?.[recordId];
    const detail = config.detailRecords?.[recordId] ?? buildFallbackDetailRecord(row ?? {}, config);
    const [displayOption, setDisplayOption] = useState(detail.selectedDisplay ?? config.displayOptions?.[0] ?? '');

    return (
        <div className="flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={config.sectionLabel} />
            </div>

            <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
                    <div className="grid gap-y-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <SummaryField label={config.labels.date} value={detail.date} />
                        <SummaryField label={config.labels.transactionType} value={detail.transactionType} />

                        <div className="text-[17px] text-[#1f2436]">{config.labels.display}</div>
                        <SelectField
                            value={displayOption}
                            onChange={(event) => setDisplayOption(event.target.value)}
                            className="h-[34px] max-w-[458px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.displayOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <SummaryField label={config.labels.number} value={detail.documentNumber} />
                        <SummaryField label={config.labels.transactionNumber} value={detail.transactionNumber} />
                    </div>
                </div>

                <div className="mt-6 border-t border-[#a8a8a8] bg-[#d8d8d8]">
                    <div className="grid grid-cols-[240px_minmax(0,1fr)_220px_220px]">
                        <AmountColumn label={config.labels.accountCode} align="left" />
                        <AmountColumn label={config.labels.accountName} align="left" />
                        <AmountColumn label={config.labels.debit} />
                        <AmountColumn label={config.labels.credit} />
                    </div>
                </div>

                <div className="px-2 py-2">
                    <div className="text-[16px] font-semibold text-[#111827]">{detail.reviewedAt}</div>
                    <div className="mt-1 text-[16px] text-[#111827]">{detail.reviewer}</div>

                    <div className="mt-4 space-y-3">
                        {detail.entries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-[240px_minmax(0,1fr)_220px_220px] gap-x-3">
                                <div className="text-[17px] text-[#1f2436]">{entry.accountCode}</div>
                                <div className="text-[17px] text-[#1f2436]">{entry.accountName}</div>
                                <div className="text-right text-[17px] text-[#1f2436]">{formatTableTextValue(entry.debit)}</div>
                                <div className="text-right text-[17px] text-[#1f2436]">{formatTableTextValue(entry.credit)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 grid grid-cols-[240px_minmax(0,1fr)_220px_220px] gap-x-3">
                        <div />
                        <div />
                        <div className="pt-1 text-right">
                            <div className="ml-auto h-px w-full max-w-[454px] bg-[#1f2436]" />
                            <div className="pt-1 text-[18px] font-semibold text-[#111827]">{detail.totalDebit}</div>
                        </div>
                        <div className="pt-1 text-right">
                            <div className="ml-auto h-px w-full max-w-[454px] bg-[#1f2436]" />
                            <div className="pt-1 text-[18px] font-semibold text-[#111827]">{detail.totalCredit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JournalActivityLogView({ page, activeLevel2Tab, onOpenDetail }) {
    const { rows: backendRows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'journal-activity-logs',
        filters: {
            per_page: 100,
        },
    });
    const mappedRows = useMemo(() => mapJournalActivityRows(backendRows), [backendRows]);
    const config = useMemo(
        () => ({
            ...page.journalActivityLog,
            table: {
                ...page.journalActivityLog.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat data...' : page.journalActivityLog.table?.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
            },
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [error, loading, mappedRows, page.journalActivityLog, reload, total],
    );

    return activeLevel2Tab?.tabType === 'detail' ? (
        <JournalActivityLogDetailView config={config} activeLevel2Tab={activeLevel2Tab} />
    ) : (
        <JournalActivityLogTableView config={config} onOpenDetail={onOpenDetail} />
    );
}
