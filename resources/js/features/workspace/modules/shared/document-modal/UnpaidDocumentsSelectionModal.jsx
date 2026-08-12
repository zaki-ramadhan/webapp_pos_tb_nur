import { useEffect, useMemo, useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { formatCurrencyValue, parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export default function UnpaidDocumentsSelectionModal({
    open = false,
    onClose,
    onConfirm,
    title = 'Faktur Belum Lunas',
    resource = 'sales-invoices',
    partnerId = null,
    partnerQueryKey = 'customer_id',
}) {
    const [keyword, setKeyword] = useState('');
    const [filterType, setFilterType] = useState('entry_date');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [sortKey, setSortKey] = useState('document_number');
    const [sortDir, setSortDir] = useState('asc');

    useEffect(() => {
        if (!open) {
            setKeyword('');
            setStartDate('');
            setEndDate('');
            setSelectedIds(new Set());
            setSortKey('document_number');
            setSortDir('asc');
            return;
        }

        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setKeyword('');
        setStartDate(formatIsoDate(thirtyDaysAgo));
        setEndDate(formatIsoDate(today));
        setSelectedIds(new Set());

        let isMounted = true;
        setLoading(true);

        const params = {
            status: 'Belum Lunas',
            per_page: 1000,
        };
        if (partnerId) {
            params[partnerQueryKey] = partnerId;
            if (partnerQueryKey === 'supplier_id') {
                params.partner_id = partnerId;
            }
        }

        listBackendResource(resource, params)
            .then((res) => {
                if (!isMounted) return;
                const dataList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                setRecords(dataList);
            })
            .catch(() => {
                if (!isMounted) return;
                setRecords([]);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [open, resource, partnerId, partnerQueryKey]);

    const handleFilterTypeChange = (newType) => {
        setFilterType(newType);
    };

    const filteredRecords = useMemo(() => {
        return records.filter((rec) => {
            const st = String(rec.status ?? '').toLowerCase();
            if (st === 'lunas' || st === 'paid' || st === 'batal' || st === 'void') {
                return false;
            }

            if (keyword.trim()) {
                const q = keyword.trim().toLowerCase();
                const num = String(rec.document_number ?? rec.number ?? '').toLowerCase();
                const partnerName = String(rec.supplier?.name ?? rec.customer?.name ?? rec.customer ?? '').toLowerCase();
                if (!num.includes(q) && !partnerName.includes(q)) {
                    return false;
                }
            }

            const targetDateRaw = filterType === 'due_date'
                ? (rec.due_date ?? rec.date ?? '')
                : (rec.entry_date ?? rec.date ?? '');
            const targetDateStr = targetDateRaw ? String(targetDateRaw).slice(0, 10) : '';

            if (startDate && targetDateStr) {
                if (targetDateStr < startDate.slice(0, 10)) return false;
            }
            if (endDate && targetDateStr) {
                if (targetDateStr > endDate.slice(0, 10)) return false;
            }

            return true;
        });
    }, [records, keyword, filterType, startDate, endDate]);

    const sortedRecords = useMemo(() => {
        return [...filteredRecords].sort((a, b) => {
            let valA = a[sortKey] ?? '';
            let valB = b[sortKey] ?? '';

            if (sortKey === 'total' || sortKey === 'outstanding') {
                valA = parseNumericInput(a.outstanding_amount ?? a.outstanding ?? a.total_amount ?? a.total ?? 0);
                valB = parseNumericInput(b.outstanding_amount ?? b.outstanding ?? b.total_amount ?? b.total ?? 0);
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredRecords, sortKey, sortDir]);

    const totalSelectedAmount = useMemo(() => {
        return records
            .filter((rec) => selectedIds.has(rec.id))
            .reduce((sum, rec) => {
                const val = parseNumericInput(rec.outstanding_amount ?? rec.outstanding ?? rec.total_amount ?? rec.total ?? 0);
                return sum + val;
            }, 0);
    }, [records, selectedIds]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const isAllSelected = sortedRecords.length > 0 && sortedRecords.every((rec) => selectedIds.has(rec.id));

    const handleToggleAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedRecords.map((rec) => rec.id)));
        }
    };

    const handleToggleRow = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleConfirmSelection = () => {
        const selectedRecords = records.filter((rec) => selectedIds.has(rec.id));
        onConfirm?.(selectedRecords);
        onClose?.();
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title={title}
            maxWidthClassName="max-w-[780px]"
            contentClassName="p-4 sm:p-5 bg-white"
            footer={
                <div className="flex items-center justify-end w-full gap-3">
                    <span className="text-xs sm:text-sm text-zinc-700 font-normal">Total Terpilih :</span>
                    <input
                        type="text"
                        readOnly
                        value={formatCurrencyValue(totalSelectedAmount)}
                        className="h-[36px] w-[140px] rounded-[4px] border border-gray-300 bg-slate-100 text-right px-3 text-xs sm:text-sm font-normal text-zinc-700 focus:outline-none"
                    />
                    <Button
                        variant="brand-blue"
                        size="md"
                        onClick={handleConfirmSelection}
                        className="!bg-[#2353a0] hover:!bg-[#1f4f96] !border-transparent !text-white font-medium px-6 shadow-btn-blue-hover"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-y-3 pb-4 bg-white">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    <div className="flex-1 min-w-[170px]">
                        <TextInput
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="No Faktur / No Form"
                            className="h-[36px] rounded-[4px] border-gray-300 bg-white"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>
                    <div className="w-[155px]">
                        <SelectField
                            value={filterType}
                            onChange={(e) => handleFilterTypeChange(e.target.value)}
                            className="h-[36px] rounded-[4px] border-gray-300 bg-white"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            <option value="entry_date">Filter Tgl Faktur</option>
                            <option value="due_date">Filter Tgl Jatuh Tempo</option>
                        </SelectField>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-[145px] sm:w-[155px]">
                            <TransactionDateInput
                                value={normalizeDisplayDate(startDate)}
                                onChange={(val) => setStartDate(formatIsoDate(val))}
                                className="h-[36px] text-xs sm:text-sm"
                            />
                        </div>
                        <span className="text-xs sm:text-sm text-zinc-500 font-normal">s/d</span>
                        <div className="w-[145px] sm:w-[155px]">
                            <TransactionDateInput
                                value={normalizeDisplayDate(endDate)}
                                onChange={(val) => setEndDate(formatIsoDate(val))}
                                className="h-[36px] text-xs sm:text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full overflow-x-auto max-h-[380px] border border-gray-200 rounded-[2px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#5a738e] text-white text-xs sm:text-sm font-normal sticky top-0 z-10">
                            <th className="py-2.5 px-3 w-[44px] text-center border-r border-slate-400/40">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleToggleAll}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#2353a0]"
                                />
                            </th>
                            <SortableTableHeaderCell
                                label="No. Faktur"
                                sortKey="document_number"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-normal text-white cursor-pointer hover:bg-slate-600/50 border-r border-slate-400/40"
                            />
                            <th className="py-2.5 px-3 font-normal text-white text-center border-r border-slate-400/40 w-[110px]">
                                Keterangan
                            </th>
                            <SortableTableHeaderCell
                                label="Tgl Faktur"
                                sortKey="entry_date"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-normal text-white w-[115px] text-center cursor-pointer hover:bg-slate-600/50 border-r border-slate-400/40"
                            />
                            <SortableTableHeaderCell
                                label="Jatuh Tempo"
                                sortKey="due_date"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-normal text-white w-[115px] text-center cursor-pointer hover:bg-slate-600/50 border-r border-slate-400/40"
                            />
                            <SortableTableHeaderCell
                                label="Terhutang"
                                sortKey="outstanding"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-normal text-white w-[140px] text-right cursor-pointer hover:bg-slate-600/50"
                            />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs sm:text-sm text-zinc-700">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-2 text-center text-black italic">
                                    Memuat daftar faktur belum lunas...
                                </td>
                            </tr>
                        ) : sortedRecords.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-2 text-center text-black font-normal">
                                    Tidak ada faktur belum lunas yang ditemukan
                                </td>
                            </tr>
                        ) : (
                            sortedRecords.map((rec) => {
                                const isChecked = selectedIds.has(rec.id);
                                const docNum = rec.document_number ?? rec.number ?? '-';
                                const entryDate = normalizeDisplayDate(rec.entry_date ?? rec.date);
                                const dueDate = rec.due_date ? normalizeDisplayDate(rec.due_date) : '-';
                                const outstandingVal = parseNumericInput(rec.outstanding_amount ?? rec.outstanding ?? rec.total_amount ?? rec.total ?? 0);

                                return (
                                    <tr
                                        key={rec.id}
                                        onClick={() => handleToggleRow(rec.id)}
                                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${isChecked ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <td className="py-2.5 px-3 text-center border-r border-gray-100" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleRow(rec.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#2353a0]"
                                            />
                                        </td>
                                        <td className="py-2.5 px-3 font-normal text-zinc-700 border-r border-gray-100">
                                            {docNum}
                                        </td>
                                        <td className="py-2.5 px-3 font-normal text-zinc-500 text-center border-r border-gray-100">
                                            -
                                        </td>
                                        <td className="py-2.5 px-3 font-normal text-zinc-600 text-center border-r border-gray-100">
                                            {entryDate}
                                        </td>
                                        <td className="py-2.5 px-3 font-normal text-zinc-600 text-center border-r border-gray-100">
                                            {dueDate}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-normal text-zinc-700">
                                            {formatCurrencyValue(outstandingVal)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </WorkspaceDialog>
    );
}
