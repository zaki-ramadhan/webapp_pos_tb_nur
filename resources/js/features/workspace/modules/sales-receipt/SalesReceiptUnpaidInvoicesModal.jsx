import { useEffect, useMemo, useState } from 'react';
import DocumentModalLayout from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import CheckboxField from '@/components/ui/CheckboxField';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { formatCurrencyValue } from '@/features/workspace/modules/sales-receipt/salesReceiptCalculations';
import { listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function SalesReceiptUnpaidInvoicesModal({
    open = false,
    onClose,
    onConfirm,
    customerId = null,
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
        if (customerId) {
            params.customer_id = customerId;
        }

        listBackendResource('sales-invoices', params)
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
    }, [open, customerId]);

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

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const filteredRecords = useMemo(() => {
        return records.filter((rec) => {
            const docNum = (rec.document_number ?? rec.reference_number ?? '').toLowerCase();
            const notes = (rec.notes ?? rec.description ?? '').toLowerCase();
            const searchKw = keyword.trim().toLowerCase();

            if (searchKw && !docNum.includes(searchKw) && !notes.includes(searchKw)) {
                return false;
            }

            const targetDateStr = filterType === 'due_date' ? rec.due_date : rec.entry_date;

            if (!targetDateStr) {
                return false;
            }

            const recIso = normalizeDisplayDate(targetDateStr);
            const startIso = normalizeDisplayDate(startDate);
            const endIso = normalizeDisplayDate(endDate);

            if (startIso && recIso && recIso < startIso) return false;
            if (endIso && recIso && recIso > endIso) return false;

            return true;
        });
    }, [records, keyword, filterType, startDate, endDate]);

    const sortedRecords = useMemo(() => {
        const list = [...filteredRecords];
        if (!sortKey) return list;

        list.sort((a, b) => {
            let valA = a[sortKey] ?? '';
            let valB = b[sortKey] ?? '';

            if (sortKey === 'outstanding_amount') {
                valA = Number(a.outstanding_amount ?? a.total_amount ?? 0);
                valB = Number(b.outstanding_amount ?? b.total_amount ?? 0);
            } else if (sortKey === 'document_number') {
                valA = (a.document_number ?? a.reference_number ?? '').toLowerCase();
                valB = (b.document_number ?? b.reference_number ?? '').toLowerCase();
            } else if (sortKey === 'notes') {
                valA = (a.notes ?? a.description ?? '').toLowerCase();
                valB = (b.notes ?? b.description ?? '').toLowerCase();
            } else if (sortKey === 'entry_date' || sortKey === 'due_date') {
                valA = normalizeDisplayDate(valA);
                valB = normalizeDisplayDate(valB);
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [filteredRecords, sortKey, sortDir]);

    const allFilteredSelected = useMemo(() => {
        if (!sortedRecords.length) return false;
        return sortedRecords.every((rec) => selectedIds.has(String(rec.id)));
    }, [sortedRecords, selectedIds]);

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedIds(new Set());
        } else {
            const nextSet = new Set(selectedIds);
            sortedRecords.forEach((rec) => nextSet.add(String(rec.id)));
            setSelectedIds(nextSet);
        }
    };

    const toggleSelectOne = (idStr) => {
        const nextSet = new Set(selectedIds);
        if (nextSet.has(idStr)) {
            nextSet.delete(idStr);
        } else {
            nextSet.add(idStr);
        }
        setSelectedIds(nextSet);
    };

    const selectedTotalOutstanding = useMemo(() => {
        let total = 0;
        records.forEach((rec) => {
            if (selectedIds.has(String(rec.id))) {
                const outVal = Number(rec.outstanding_amount ?? rec.total_amount ?? 0);
                total += outVal;
            }
        });
        return total;
    }, [records, selectedIds]);

    const handleConfirm = () => {
        if (selectedIds.size > 0) {
            const selectedList = records.filter((rec) => selectedIds.has(String(rec.id)));
            onConfirm?.(selectedList);
        }
        onClose?.();
    };

    if (!open) return null;

    const modalFooter = (
        <div className="flex items-center justify-end gap-6 pt-3 border-t border-ui-border-medium select-none">
            <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-normal text-brand-dark">Total Terpilih :</span>
                <div className="w-[180px]">
                    <TextInput
                        readOnly
                        value={formatCurrencyValue(selectedTotalOutstanding)}
                        className="h-[38px] rounded-[4px] border-ui-border bg-slate-50 font-normal text-xs sm:text-sm text-brand-dark"
                        inputClassName="text-right font-normal text-xs sm:text-sm text-brand-dark px-3"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex h-10 items-center justify-center rounded-[4px] border border-brand-blue bg-brand-blue px-6 text-sm font-normal text-white hover:bg-brand-blue-hover active:scale-[0.98] transition cursor-pointer select-none shadow-button-primary"
            >
                Lanjut
            </button>
        </div>
    );

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title="Faktur Belum Lunas"
            closeAriaLabel="Tutup faktur belum lunas"
            panelClassName="max-w-[880px] w-full h-[520px] overflow-hidden rounded-[6px] px-0 py-0 flex flex-col"
            contentClassName="px-3 pt-2.5 pb-2.5 flex-1 flex flex-col overflow-hidden"
            bodyClassName="flex-1 flex flex-col overflow-hidden"
            footer={modalFooter}
        >
            {/* Toolbar Filter */}
            <div className="mb-3 flex items-center gap-3 shrink-0">
                <div className="flex-1 min-w-[200px]">
                    <TextInput
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="No Faktur / No Form"
                        className="h-[38px] rounded-[4px] border-ui-border text-xs sm:text-sm font-normal"
                        inputClassName="text-xs sm:text-sm text-brand-dark font-normal px-3"
                    />
                </div>

                <div className="w-[165px] shrink-0">
                    <SelectField
                        value={filterType}
                        onChange={(e) => handleFilterTypeChange(e.target.value)}
                        className="h-[38px] rounded-[4px] border-ui-border text-xs sm:text-sm font-normal"
                        selectClassName="text-xs sm:text-sm text-brand-dark font-normal px-3"
                    >
                        <option value="entry_date">Filter Tgl Faktur</option>
                        <option value="due_date">Filter Tgl Jatuh Tempo</option>
                    </SelectField>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <TransactionDateInput
                        value={startDate}
                        onChange={(val) => setStartDate(val)}
                        placeholder="DD/MM/YYYY"
                        className="w-[155px] h-[38px] text-xs sm:text-sm font-normal"
                    />
                    <span className="text-xs text-slate-500 font-normal">s/d</span>
                    <TransactionDateInput
                        value={endDate}
                        onChange={(val) => setEndDate(val)}
                        placeholder="DD/MM/YYYY"
                        className="w-[155px] h-[38px] text-xs sm:text-sm font-normal"
                    />
                </div>
            </div>

            {/* Table Container - FIXED STABLE CONTAINER HEIGHT */}
            <div className="flex-1 overflow-x-auto overflow-y-auto h-[340px]">
                <DataTable className="w-full text-xs sm:text-sm font-normal">
                    <DataTableHeader className="bg-[#3b5166] text-white sticky top-0 z-10">
                        <DataTableRow className="border-b border-slate-600">
                            <DataTableHead className="w-[40px] text-center px-2 py-2.5">
                                <CheckboxField
                                    checked={allFilteredSelected}
                                    onChange={toggleSelectAll}
                                    align="center"
                                    size="sm"
                                    containerClassName="flex justify-center"
                                />
                            </DataTableHead>
                            <SortableTableHeaderCell
                                label="No. Faktur"
                                align="left"
                                sortable={true}
                                sortDirection={sortKey === 'document_number' ? sortDir : null}
                                onSort={() => handleSort('document_number')}
                                className="!py-2.5 text-xs font-normal"
                            />
                            <SortableTableHeaderCell
                                label="Keterangan"
                                align="left"
                                sortable={true}
                                sortDirection={sortKey === 'notes' ? sortDir : null}
                                onSort={() => handleSort('notes')}
                                className="!py-2.5 text-xs font-normal"
                            />
                            <SortableTableHeaderCell
                                label="Tgl Faktur"
                                align="center"
                                sortable={true}
                                sortDirection={sortKey === 'entry_date' ? sortDir : null}
                                onSort={() => handleSort('entry_date')}
                                className="!py-2.5 text-xs font-normal"
                            />
                            <SortableTableHeaderCell
                                label="Jatuh Tempo"
                                align="center"
                                sortable={true}
                                sortDirection={sortKey === 'due_date' ? sortDir : null}
                                onSort={() => handleSort('due_date')}
                                className="!py-2.5 text-xs font-normal"
                            />
                            <SortableTableHeaderCell
                                label="Terutang"
                                align="right"
                                sortable={true}
                                sortDirection={sortKey === 'outstanding_amount' ? sortDir : null}
                                onSort={() => handleSort('outstanding_amount')}
                                className="!py-2.5 text-xs font-normal"
                            />
                        </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                        {loading ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center py-6 text-slate-500 font-normal">
                                    Memuat data faktur belum lunas...
                                </DataTableCell>
                            </DataTableRow>
                        ) : sortedRecords.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center py-6 text-slate-500 font-normal">
                                    Tidak ada data.
                                </DataTableCell>
                            </DataTableRow>
                        ) : (
                            sortedRecords.map((rec) => {
                                const idStr = String(rec.id);
                                const isChecked = selectedIds.has(idStr);
                                const docNum = rec.document_number ?? rec.reference_number ?? '-';
                                const notes = rec.notes ?? rec.description ?? '-';
                                const entryDateStr = rec.entry_date ? formatIsoDate(rec.entry_date) : '-';
                                const dueDateStr = rec.due_date ? formatIsoDate(rec.due_date) : '-';
                                const outstandingVal = Number(rec.outstanding_amount ?? rec.total_amount ?? 0);

                                return (
                                    <DataTableRow
                                        key={idStr}
                                        className={`cursor-pointer hover:bg-slate-50 transition-colors border-b border-ui-border-light ${isChecked ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleSelectOne(idStr)}
                                    >
                                        <DataTableCell className="text-center px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                                            <CheckboxField
                                                checked={isChecked}
                                                onChange={() => toggleSelectOne(idStr)}
                                                align="center"
                                                size="sm"
                                                containerClassName="flex justify-center"
                                            />
                                        </DataTableCell>
                                        <DataTableCell className="font-normal text-brand-dark px-3 py-2.5">{docNum}</DataTableCell>
                                        <DataTableCell className="font-normal text-slate-600 px-3 py-2.5 max-w-[220px] truncate">{notes}</DataTableCell>
                                        <DataTableCell className="font-normal text-center text-slate-600 whitespace-nowrap px-3 py-2.5 w-[110px]">{entryDateStr}</DataTableCell>
                                        <DataTableCell className="font-normal text-center text-slate-600 whitespace-nowrap px-3 py-2.5 w-[110px]">{dueDateStr}</DataTableCell>
                                        <DataTableCell className="font-normal text-right text-brand-dark px-3 py-2.5">
                                            {formatCurrencyValue(outstandingVal)}
                                        </DataTableCell>
                                    </DataTableRow>
                                );
                            })
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </DocumentModalLayout>
    );
}
