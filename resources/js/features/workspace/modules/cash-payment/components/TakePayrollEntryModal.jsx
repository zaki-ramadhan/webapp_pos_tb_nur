import { useState, useEffect, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
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

const YEAR_OPTIONS = ['2027', '2026', '2025', '2024', '2023', '2022', '2021'];

export default function TakePayrollEntryModal({ open, onClose, onApply }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    
  // Default to "all" to show all records initially

    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    
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

  // Reset selection and filters when modal closes

    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setSelectedType('all');
            setSelectedMonth('all');
            setSelectedYear('all');
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
        if (selectedRecords.length === 0) return;
        onApply(selectedRecords);
        onClose();
    }

    const columns = useMemo(() => [
        { id: 'checkbox', label: '', widthClassName: 'w-px', align: 'center' },
        { id: 'document_number', label: 'No. Beban #' },
        { id: 'parsedPeriod', label: 'Periode', widthClassName: 'w-[160px]' },
        { id: 'due_date', label: 'Jatuh Tempo', widthClassName: 'w-[120px]' },
        { id: 'total_amount', label: 'Total', widthClassName: 'w-[140px]', align: 'right' },
        { id: 'parsedType', label: 'Tipe', widthClassName: 'w-[120px]' },
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
            maxWidthClassName="!max-w-[760px] w-full"
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
                        disabled={selectedIds.size === 0}
                        className="rounded-[4px] px-6 font-normal"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="w-full sm:max-w-[180px]">
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

                <div className="w-[120px]">
                    <SelectField
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="h-[36px] rounded-[4px] border-ui-border bg-white"
                        selectClassName="text-xs sm:text-sm text-brand-dark px-2"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="Bulanan">Bulanan</option>
                    </SelectField>
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-dark font-normal ml-auto">
                    <span>Periode:</span>
                    <div className="w-[120px]">
                        <SelectField
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark px-2"
                        >
                            <option value="all">Semua Bulan</option>
                            {INDONESIAN_MONTHS.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </SelectField>
                    </div>
                    <div className="w-[90px]">
                        <SelectField
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark px-2"
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
                    emptyLabel={loading ? 'Memuat data...' : 'Belum ada data'}
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
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={handleSelectAll}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 rounded border-white/30 bg-transparent text-pink-accent focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                            );
                        }
                        return column.label;
                    }}
                    renderCell={({ row, column }) => {
                        if (column.id === 'checkbox') {
                            const isSelected = selectedIds.has(String(row.id));
                            return (
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleRecord(row.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 rounded border-ui-border text-pink-accent focus:ring-0 focus:ring-offset-0 cursor-pointer"
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
                            return formatCurrencyValue(row.total_amount ?? 0);
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
