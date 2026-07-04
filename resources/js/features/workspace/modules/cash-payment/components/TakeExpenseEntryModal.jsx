import { useState, useEffect, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import { SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';
import { listBackendResource, extractBackendRows } from '@/features/workspace/backend/workspaceBackendApi';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TransactionDateInput from '@/features/workspace/modules/shared/transaction/TransactionDateInput';

export default function TakeExpenseEntryModal({ open, onClose, onApply }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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
                const response = await listBackendResource('expense-entries', {
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
            setStartDate('');
            setEndDate('');
            setSelectedIds(new Set());
        }
    }, [open]);

    // Filter records client-side by date range
    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            const due = record.due_date; // YYYY-MM-DD
            if (startDate && due && due < startDate) return false;
            if (endDate && due && due > endDate) return false;
            return true;
        });
    }, [records, startDate, endDate]);

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
        { id: 'checkbox', label: '', widthClassName: 'w-[36px]', align: 'center' },
        { id: 'document_number', label: 'No. Beban #' },
        { id: 'entry_date', label: 'Tanggal', widthClassName: 'w-[120px]' },
        { id: 'due_date', label: 'Jatuh Tempo', widthClassName: 'w-[120px]' },
        { id: 'total_amount', label: 'Total', widthClassName: 'w-[140px]', align: 'right' },
        { id: 'notes', label: 'Keterangan' },
    ], []);

    const allChecked =
        filteredRecords.length > 0 &&
        filteredRecords.every((r) => selectedIds.has(String(r.id)));

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Pencatatan Beban"
            headerIcon={() => null}
            maxWidthClassName="!max-w-[1380px] w-full"
            contentClassName="bg-[#f0f4f8] px-5 py-4 sm:px-6 flex flex-col gap-4 min-h-[480px] max-h-[85vh] overflow-y-auto"
            footer={
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleLanjut}
                        disabled={selectedIds.size === 0}
                        className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[#0c50a4] hover:bg-[#0a4288] disabled:bg-slate-300 disabled:cursor-not-allowed px-6 text-sm font-normal text-white shadow-sm transition active:scale-[0.98] cursor-pointer"
                    >
                        Lanjut
                    </button>
                </div>
            }
        >
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-[6px] border border-slate-200">
                <div className="w-full sm:max-w-[280px]">
                    <TextInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari..."
                        trailing={
                            loading ? (
                                <LoadingIcon className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                                <SearchIcon className="h-4 w-4 text-slate-400" />
                            )
                        }
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-sm text-brand-dark"
                    />
                </div>

                <div className="flex items-center gap-2 text-sm text-brand-dark font-medium">
                    <span>Jatuh Tempo</span>
                    <TransactionDateInput
                        value={startDate}
                        onChange={setStartDate}
                        className="max-w-[140px]"
                        inputClassName="text-sm text-brand-dark"
                    />
                    <span>s/d</span>
                    <TransactionDateInput
                        value={endDate}
                        onChange={setEndDate}
                        className="max-w-[140px]"
                        inputClassName="text-sm text-brand-dark"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto border border-slate-200 rounded-[6px] bg-white min-h-[300px]">
                <TransactionDataTable
                    columns={columns}
                    rows={filteredRecords}
                    emptyLabel={loading ? 'Memuat data...' : 'Belum ada data'}
                    minWidthClassName="min-w-[1100px]"
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
                        if (column.id === 'entry_date' || column.id === 'due_date') {
                            return formatIsoDate(row[column.id]);
                        }
                        if (column.id === 'total_amount') {
                            return formatCurrencyValue(row[column.id] ?? 0);
                        }
                        return row[column.id] || '-';
                    }}
                />
            </div>
        </WorkspaceDialog>
    );
}
