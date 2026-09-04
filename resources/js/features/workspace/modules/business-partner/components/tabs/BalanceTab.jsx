import { useState } from 'react';
import { showErrorToast } from '@/components/feedback/toast';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { PlusIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import OpeningBalanceModal from '../modals/OpeningBalanceModal';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function BalanceTab({ config, values, onChange }) {
    const [showModal, setShowModal] = useState(false);
    const rows = values?.openingBalanceRows ?? values?.receivableRows ?? [];
    const isCustomer = config.partnerType !== 'supplier';
    const sectionTitle = config.balanceTable?.title || (isCustomer ? 'Piutang Awal' : 'Utang Awal');

    const totalBalance = rows.reduce((sum, item) => {
        const amt = Number(item.amount ?? 0);
        return sum + (Number.isFinite(amt) ? amt : 0);
    }, 0);

    const handleOpen = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        setShowModal(true);
    };

    const handleAdd = (newItem) => {
        onChange('openingBalanceRows', [...rows, newItem]);
    };

    const handleRemove = (index) => {
        onChange('openingBalanceRows', rows.filter((_, i) => i !== index));
    };

    const formattedTotalBalance = totalBalance > 0 ? `Rp ${formatAmountInput(totalBalance)}` : '0';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-medium pb-2">
                <div className="flex items-center gap-3">
                    <h3 className="text-base sm:text-lg font-normal text-input-brand">{sectionTitle}</h3>
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer"
                        aria-label="Tambah data"
                    >
                        <PlusIcon className="h-5 w-5 pointer-events-none" />
                    </button>
                </div>
                <div className="text-base text-slate-700 font-normal">
                    Total {sectionTitle} <span className="font-semibold text-slate-900 ml-2">{formattedTotalBalance}</span>
                </div>
            </div>

            <DataTable className="w-full min-w-[700px]" wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-table-header-bg">
                    <tr>
                        <DataTableHead className="w-[48px] min-w-[48px] max-w-[48px] px-2.5 py-2.5 text-center text-base font-light text-white whitespace-nowrap">No.</DataTableHead>
                        <DataTableHead className="w-[120px] px-3 py-2.5 text-left text-base font-light text-white">Tanggal</DataTableHead>
                        <DataTableHead className="w-[150px] px-3 py-2.5 text-right text-base font-light text-white">Jumlah</DataTableHead>
                        <DataTableHead className="w-[160px] px-3 py-2.5 text-left text-base font-light text-white">Mata Uang</DataTableHead>
                        <DataTableHead className="w-[180px] px-3 py-2.5 text-left text-base font-light text-white">Nomor</DataTableHead>
                        <DataTableHead className="px-3 py-2.5 text-left text-base font-light text-white">Keterangan</DataTableHead>
                        <DataTableHead className="w-[60px] px-3 py-2.5 text-center text-base font-light text-white">Aksi</DataTableHead>
                    </tr>
                </DataTableHeader>
                <DataTableBody>
                    {rows.length === 0 ? (
                        <DataTableRow className="bg-white table-row-empty" data-empty-row="true">
                            <DataTableCell colSpan={7} className="px-3 py-2 text-center text-base text-text-workspace-dark">
                                Tidak ada data
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        rows.map((row, index) => (
                            <DataTableRow key={row.id || index} className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`}>
                                <DataTableCell className="w-[48px] min-w-[48px] max-w-[48px] px-2.5 text-center text-base text-table-row-number whitespace-nowrap">{index + 1}</DataTableCell>
                                <DataTableCell className="px-3 text-left text-base text-text-workspace-dark">{row.date || '-'}</DataTableCell>
                                <DataTableCell className="px-3 text-right text-base text-text-workspace-dark font-medium">{formatAmountInput(row.amount)}</DataTableCell>
                                <DataTableCell className="px-3 text-left text-base text-text-workspace-dark">{row.currency || 'Indonesian Rupiah'}</DataTableCell>
                                <DataTableCell className="px-3 text-left text-base text-text-workspace-dark font-medium">{row.number || '-'}</DataTableCell>
                                <DataTableCell className="px-3 text-left text-base text-text-workspace-dark">{row.notes || '-'}</DataTableCell>
                                <DataTableCell className="px-3 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                        title="Hapus"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </DataTableBody>
            </DataTable>

            <OpeningBalanceModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAdd}
                partnerType={config.partnerType}
                existingCount={rows.length}
            />
        </div>
    );
}
