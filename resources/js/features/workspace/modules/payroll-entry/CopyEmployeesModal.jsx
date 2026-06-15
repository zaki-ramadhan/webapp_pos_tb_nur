import { useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DataTable, DataTableBody, DataTableHead, DataTableHeader, DataTableRow } from '@/components/ui/DataTable';

const STATUS_OPTIONS = [
    { value: 'pegawai-tetap', label: 'Pegawai Tetap' },
    { value: 'pegawai-tidak-tetap', label: 'Pegawai Tidak Tetap' },
    { value: 'bukan-pegawai-mlm', label: 'Bukan Pegawai - Distributor MLM' },
    { value: 'bukan-pegawai-asuransi', label: 'Bukan Pegawai - Petugas Dinas Luar Asuransi' },
    { value: 'bukan-pegawai-penjaja', label: 'Bukan Pegawai - Penjaja Barang Dagangan' },
    { value: 'bukan-pegawai-tenaga-ahli', label: 'Bukan Pegawai - Tenaga Ahli' },
    { value: 'dewan-komisaris', label: 'Anggota Dewan Komisaris atau Dewan Pengawas' },
    { value: 'bukan-pegawai-berkesinambungan', label: 'Bukan Pegawai yang Menerima Imbalan Bersifat Berkesinambungan' },
    { value: 'bukan-pegawai-tidak-berkesinambungan', label: 'Bukan Pegawai yang Menerima Imbalan Tidak Bersifat Berkesinambungan' },
];

export default function CopyEmployeesModal({ open, onClose }) {
    const [selectedStatus, setSelectedStatus] = useState('pegawai-tetap');

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Salin Karyawan"
            maxWidthClassName="max-w-[720px]"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" size="md" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="primary" size="md" onClick={onClose}>
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Status Dropdown - leaves 1/4 spacing on the right */}
                <div className="w-full sm:max-w-[75%]">
                    <SelectField
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        placeholder="Pilih Kategori Karyawan..."
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                {/* Table with Checkbox, Karyawan, and Nilai */}
                <div className="mt-2">
                    <DataTable>
                        <DataTableHeader>
                            <DataTableRow className="bg-[#173664] text-white border-t-0">
                                <DataTableHead className="w-[48px] text-center">
                                    <input
                                        type="checkbox"
                                        disabled
                                        className="h-4 w-4 rounded border-slate-300 text-[#21539b] focus:ring-[#21539b]"
                                    />
                                </DataTableHead>
                                <DataTableHead className="text-center font-semibold">
                                    Karyawan
                                </DataTableHead>
                                <DataTableHead className="text-center font-semibold w-[160px]">
                                    Nilai
                                </DataTableHead>
                            </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                            <DataTableRow>
                                <td colSpan={3} className="px-4 py-8">
                                    <EmptyState
                                        title="Belum ada data"
                                        description="Data karyawan tidak ditemukan untuk kategori ini."
                                        size="sm"
                                        tone="subtle"
                                    />
                                </td>
                            </DataTableRow>
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </WorkspaceDialog>
    );
}
