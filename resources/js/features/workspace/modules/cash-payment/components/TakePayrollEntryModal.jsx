import { useState, useEffect, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import CheckboxField from '@/components/ui/CheckboxField';
import Button from '@/components/ui/Button';
import { SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';
import { listBackendResource, extractBackendRows } from '@/features/workspace/backend/workspaceBackendApi';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const currentYearNum = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => String(currentYearNum + 1 - i));

export default function TakePayrollEntryModal({ open, onClose, onApply }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    
    // Default to current month and current year dynamically
    const [selectedMonth, setSelectedMonth] = useState(() => INDONESIAN_MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
    
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Fetch records on open or search query change
    useEffect(() => {
        if (!open) return;

        let ignore = false;
        async function fetchRecords() {
            setLoading(true);
            try {
                const response = await listBackendResource('payroll-entries', {
                    search: searchQuery.trim(),
                    per_page: 150,
                });
                if (!ignore) {
                    const rows = extractBackendRows(response);
                    setRecords(rows);
                }
            } catch (err) {
                if (!ignore) {
                    setRecords([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        const timeoutId = setTimeout(fetchRecords, 200);

        return () => {
            ignore = true;
            clearTimeout(timeoutId);
        };
    }, [open, searchQuery]);

    // Reset selection and set filters to current date when modal opens
    useEffect(() => {
        if (open) {
            setSearchQuery('');
            setSelectedType('all');
            setSelectedMonth(INDONESIAN_MONTHS[new Date().getMonth()]);
            setSelectedYear(String(new Date().getFullYear()));
            setSelectedIds(new Set());
        }
    }, [open]);

  // Parse period month, year and payment type helper

    const parsedRecords = useMemo(() => {
        return records.map((record) => {
            let month = record.metadata?.period_month ?? '';
            let year = record.metadata?.period_year ?? '';
            const paymentType = record.metadata?.payment_type ?? 'Bulanan';

            if (!month || !year) {
                if (record.entry_date) {
                    const date = new Date(record.entry_date);
                    if (!isNaN(date.getTime())) {
                        month = INDONESIAN_MONTHS[date.getMonth()];
                        year = String(date.getFullYear());
                    }
                }
            }

            return {
                ...record,
                parsedMonth: month,
                parsedYear: year,
                parsedPeriod: `${month} ${year}`.trim() || '-',
                parsedType: paymentType,
            };
        });
    }, [records]);

  // Filter records client-side by type, month, and year

    const filteredRecords = useMemo(() => {
        return parsedRecords.filter((record) => {
            const rawStatus = String(record.status ?? '').toLowerCase();
            const isFullyPaid = rawStatus === 'terbayar' || rawStatus === 'lunas' || (record.outstanding_amount !== undefined && Number(record.outstanding_amount) <= 0.01 && Number(record.paid_amount) > 0);
            if (isFullyPaid) return false;
            if (selectedType !== 'all' && record.parsedType !== selectedType) return false;
            if (selectedMonth !== 'all' && record.parsedMonth !== selectedMonth) return false;
            if (selectedYear !== 'all' && record.parsedYear !== selectedYear) return false;
            return true;
        });
    }, [parsedRecords, selectedType, selectedMonth, selectedYear]);

  // Checkbox toggles

    function handleSelectAll(e) {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredRecords.map((r) => String(r.id))));
        } else {
            setSelectedIds(new Set());
        }
    }

    function handleToggleRecord(id) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const strId = String(id);
            if (next.has(strId)) {
                next.delete(strId);
            } else {
                next.add(strId);
            }
            return next;
        });
    }

    function handleLanjut() {
        const selectedRecords = records.filter((r) => selectedIds.has(String(r.id)));
        if (selectedRecords.length === 0) {
            onClose();
            return;
        }
        onApply(selectedRecords);
        onClose();
    }

    const columns = useMemo(() => [
        { id: 'checkbox', label: '', widthClassName: 'w-px', align: 'center' },
        { id: 'document_number', label: 'No. Gaji' },
        { id: 'parsedPeriod', label: 'Periode', widthClassName: 'w-[150px]' },
        { id: 'due_date', label: 'Jatuh Tempo', widthClassName: 'w-[120px]' },
        { id: 'total_amount', label: 'Total', widthClassName: 'w-[150px]', align: 'right' },
        { id: 'parsedType', label: 'Tipe', widthClassName: 'w-[110px]' },
    ], []);

    const allChecked =
        filteredRecords.length > 0 &&
        filteredRecords.every((r) => selectedIds.has(String(r.id)));

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Pencatatan Gaji"
            headerIcon={() => null}
            maxWidthClassName="!max-w-[860px] w-full"
            contentClassName="bg-white px-4 py-3 flex flex-col gap-3 min-h-[320px] max-h-[60vh] overflow-y-auto"
            footer={
                <div className="flex justify-between items-center w-full">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        className="rounded-[4px] font-normal border-brand-blue text-brand-blue hover:bg-brand-blue/5 shadow-none"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleLanjut}
                        className="rounded-[4px] px-6 font-normal"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-full sm:w-[170px]">
                        <TextInput
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari..."
                            trailing={
                                loading ? (
                                    <LoadingIcon className="h-4.5 w-4.5 animate-spin text-slate-400" />
                                ) : (
                                    <SearchIcon className="h-4.5 w-4.5 text-slate-400" />
                                )
                            }
                            className="h-[36px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>

                    <div className="min-w-[130px]">
                        <SelectField
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark pl-2.5 pr-7"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="Bulanan">Bulanan</option>
                        </SelectField>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-dark font-normal ml-auto">
                    <span className="whitespace-nowrap">Periode:</span>
                    <div className="min-w-[140px]">
                        <SelectField
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark pl-2.5 pr-7"
                        >
                            <option value="all">Semua Bulan</option>
                            {INDONESIAN_MONTHS.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </SelectField>
                    </div>
                    <div className="min-w-[125px]">
                        <SelectField
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark pl-2.5 pr-7"
                        >
                            <option value="all">Semua Tahun</option>
                            {YEAR_OPTIONS.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </SelectField>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto border border-slate-200 rounded-[4px] bg-white min-h-[220px]">
                <TransactionDataTable
                    columns={columns}
                    rows={filteredRecords}
                    emptyLabel={loading ? 'Memuat data...' : 'Tidak ada data'}
                    minWidthClassName="min-w-[700px]"
                    showNumbering={false}
                    onRowClick={(row) => handleToggleRecord(row.id)}
                    getRowClassName={(row) => {
                        const isSelected = selectedIds.has(String(row.id));
                        return `cursor-pointer transition hover:bg-workspace-hover-bg ${
                            isSelected ? 'bg-blue-50/40 hover:bg-blue-50' : ''
                        }`;
                    }}
                    renderHeaderCell={(column) => {
                        if (column.id === 'checkbox') {
                            return (
                                <CheckboxField
                                    id="take-payroll-select-all"
                                    checked={allChecked}
                                    onChange={handleSelectAll}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                    containerClassName="flex justify-center"
                                />
                            );
                        }
                        return column.label;
                    }}
                    renderCell={({ row, column }) => {
                        if (column.id === 'checkbox') {
                            const isSelected = selectedIds.has(String(row.id));
                            return (
                                <CheckboxField
                                    id={`take-payroll-item-${row.id}`}
                                    checked={isSelected}
                                    onChange={() => handleToggleRecord(row.id)}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px] pointer-events-none"
                                    containerClassName="flex justify-center"
                                />
                            );
                        }
                        if (column.id === 'parsedPeriod') {
                            return row.parsedPeriod;
                        }
                        if (column.id === 'due_date') {
                            return row.due_date ? formatIsoDate(row.due_date) : '-';
                        }
                        if (column.id === 'total_amount') {
                            const total = Number(row.total_amount ?? 0);
                            const outstanding = row.outstanding_amount !== undefined ? Number(row.outstanding_amount) : total;
                            if (outstanding < total && outstanding > 0) {
                                return (
                                    <div className="flex flex-col items-end gap-0.5 leading-snug">
                                        <span className="font-normal text-text-darkest text-xs sm:text-sm">
                                            Sisa: Rp {outstanding.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-xs text-text-muted line-through">
                                            Total: Rp {total.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                );
                            }
                            return formatCurrencyValue(total);
                        }
                        if (column.id === 'parsedType') {
                            return row.parsedType;
                        }
                        return row[column.id] || '-';
                    }}
                />
            </div>
        </WorkspaceDialog>
    );
}
