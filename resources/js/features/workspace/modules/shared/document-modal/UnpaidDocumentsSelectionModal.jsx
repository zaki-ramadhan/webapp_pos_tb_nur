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
    title = 'Daftar Faktur Belum Lunas',
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
        const today = new Date();

        if (newType === 'due_date') {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - 30);
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + 30);

            setStartDate(formatIsoDate(pastDate));
            setEndDate(formatIsoDate(futureDate));
        } else {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - 30);

            setStartDate(formatIsoDate(pastDate));
            setEndDate(formatIsoDate(today));
        }
    };

    const filteredRecords = useMemo(() => {
        return records.filter((rec) => {
            if (keyword.trim()) {
                const q = keyword.trim().toLowerCase();
                const num = String(rec.document_number ?? rec.number ?? '').toLowerCase();
                const partnerName = String(rec.supplier?.name ?? rec.customer?.name ?? rec.customer ?? '').toLowerCase();
                if (!num.includes(q) && !partnerName.includes(q)) {
                    return false;
                }
            }

            const targetDateStr = filterType === 'due_date'
                ? (rec.due_date ?? rec.date ?? '')
                : (rec.entry_date ?? rec.date ?? '');

            if (startDate && targetDateStr) {
                if (new Date(targetDateStr) < new Date(startDate)) return false;
            }
            if (endDate && targetDateStr) {
                if (new Date(targetDateStr) > new Date(endDate)) return false;
            }

            return true;
        });
    }, [records, keyword, filterType, startDate, endDate]);

    const sortedRecords = useMemo(() => {
        return [...filteredRecords].sort((a, b) => {
            let valA = a[sortKey] ?? '';
            let valB = b[sortKey] ?? '';

            if (sortKey === 'total' || sortKey === 'outstanding') {
                valA = parseNumericInput(valA);
                valB = parseNumericInput(valB);
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredRecords, sortKey, sortDir]);

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
            maxWidthClassName="max-w-[840px]"
            contentClassName="p-0 bg-white"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-zinc-500 font-normal">
                        Terpilih: <span className="font-semibold text-zinc-800">{selectedIds.size}</span> faktur
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={onClose}
                            className="px-5 text-xs text-zinc-600"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="brand-blue"
                            size="md"
                            onClick={handleConfirmSelection}
                            className="!bg-[#2353a0] hover:!bg-[#1f4f96] !border-transparent !text-white font-medium px-6 shadow-btn-blue-hover"
                        >
                            Lanjut
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-y-3 p-4 bg-slate-50/60 border-b border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                        <TextInput
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Cari nomor faktur..."
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            inputClassName="text-xs text-brand-dark"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <SelectField
                            value={filterType}
                            onChange={(e) => handleFilterTypeChange(e.target.value)}
                            className="h-[36px] rounded-[4px] border-ui-border bg-white"
                            selectClassName="text-xs text-brand-dark"
                        >
                            <option value="entry_date">Tanggal Faktur</option>
                            <option value="due_date">Tanggal Jatuh Tempo</option>
                        </SelectField>
                    </div>
                    <div className="sm:col-span-5 flex items-center gap-2">
                        <TransactionDateInput
                            value={normalizeDisplayDate(startDate)}
                            onChange={(val) => setStartDate(formatIsoDate(val))}
                            className="h-[36px] text-xs"
                        />
                        <span className="text-xs text-zinc-400">s/d</span>
                        <TransactionDateInput
                            value={normalizeDisplayDate(endDate)}
                            onChange={(val) => setEndDate(formatIsoDate(val))}
                            className="h-[36px] text-xs"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full overflow-x-auto max-h-[380px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#5a738e] text-white text-xs font-semibold sticky top-0 z-10">
                            <th className="py-2.5 px-3 w-[44px] text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleToggleAll}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#2353a0]"
                                />
                            </th>
                            <SortableTableHeaderCell
                                label="Nomor Faktur #"
                                sortKey="document_number"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-semibold text-white cursor-pointer hover:bg-slate-600/50"
                            />
                            <SortableTableHeaderCell
                                label="Tanggal"
                                sortKey="entry_date"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-semibold text-white w-[110px] cursor-pointer hover:bg-slate-600/50"
                            />
                            <SortableTableHeaderCell
                                label="Jatuh Tempo"
                                sortKey="due_date"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-semibold text-white w-[110px] cursor-pointer hover:bg-slate-600/50"
                            />
                            <SortableTableHeaderCell
                                label="Total Faktur"
                                sortKey="total"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-semibold text-white w-[140px] text-right cursor-pointer hover:bg-slate-600/50"
                            />
                            <SortableTableHeaderCell
                                label="Terhutang"
                                sortKey="outstanding"
                                activeSortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                                className="py-2.5 px-3 font-semibold text-white w-[140px] text-right cursor-pointer hover:bg-slate-600/50"
                            />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs sm:text-sm text-zinc-700">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-zinc-400 italic">
                                    Memuat daftar faktur belum lunas...
                                </td>
                            </tr>
                        ) : sortedRecords.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-zinc-500 font-normal">
                                    Tidak ada faktur belum lunas yang ditemukan
                                </td>
                            </tr>
                        ) : (
                            sortedRecords.map((rec) => {
                                const isChecked = selectedIds.has(rec.id);
                                const docNum = rec.document_number ?? rec.number ?? '-';
                                const entryDate = normalizeDisplayDate(rec.entry_date ?? rec.date);
                                const dueDate = normalizeDisplayDate(rec.due_date ?? rec.date);
                                const totalVal = parseNumericInput(rec.total_amount ?? rec.total);
                                const outstandingVal = parseNumericInput(rec.outstanding_amount ?? rec.outstanding ?? totalVal);

                                return (
                                    <tr
                                        key={rec.id}
                                        onClick={() => handleToggleRow(rec.id)}
                                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${isChecked ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleRow(rec.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#2353a0]"
                                            />
                                        </td>
                                        <td className="py-3 px-3 font-medium text-zinc-800">
                                            {docNum}
                                        </td>
                                        <td className="py-3 px-3 font-normal text-zinc-600">
                                            {entryDate}
                                        </td>
                                        <td className="py-3 px-3 font-normal text-zinc-600">
                                            {dueDate}
                                        </td>
                                        <td className="py-3 px-3 text-right font-normal text-zinc-700">
                                            Rp {formatCurrencyValue(totalVal)}
                                        </td>
                                        <td className="py-3 px-3 text-right font-semibold text-zinc-800">
                                            Rp {formatCurrencyValue(outstandingVal)}
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
