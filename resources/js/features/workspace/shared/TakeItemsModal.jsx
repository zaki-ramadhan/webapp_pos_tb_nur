import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import CheckboxField from '@/components/ui/CheckboxField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';

export default function TakeItemsModal({ open, onClose, onApply, mode = 'purchase' }) {
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        if (!open) return;

        let ignore = false;
        setLoading(true);

        axios.get('/api/backend/products', { params: { per_page: 1000 } })
            .then((response) => {
                if (ignore) return;
                const data = response.data?.data ?? response.data ?? [];
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!ignore) setProducts([]);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            setFilterCategory('');
            setFilterBrand('');
            setSelectedIds(new Set());
        }
    }, [open]);

    const filteredProducts = useMemo(() => {
        const catQuery = filterCategory.trim().toLowerCase();
        const brandQuery = filterBrand.trim().toLowerCase();

        return products.filter((p) => {
            const categoryName = String(p.category?.name ?? p.category ?? '').toLowerCase();
            const brandName = String(p.brand?.name ?? p.brand ?? '').toLowerCase();
            const productName = String(p.name ?? '').toLowerCase();
            const productCode = String(p.code ?? '').toLowerCase();

            if (catQuery && !categoryName.includes(catQuery) && !productName.includes(catQuery) && !productCode.includes(catQuery)) {
                return false;
            }

            if (brandQuery && !brandName.includes(brandQuery) && !productName.includes(brandQuery) && !productCode.includes(brandQuery)) {
                return false;
            }

            return true;
        });
    }, [products, filterCategory, filterBrand]);

    const allChecked =
        filteredProducts.length > 0 &&
        filteredProducts.every((p) => selectedIds.has(String(p.id)));

    function handleSelectAll(e) {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredProducts.map((p) => String(p.id))));
        } else {
            setSelectedIds(new Set());
        }
    }

    function handleToggleRow(idStr) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(idStr)) {
                next.delete(idStr);
            } else {
                next.add(idStr);
            }
            return next;
        });
    }

    function handleLanjut() {
        const selectedProducts = products.filter((p) => selectedIds.has(String(p.id)));
        if (selectedProducts.length === 0) return;
        onApply?.(selectedProducts);
        onClose?.();
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Ambil Barang & Jasa"
            headerIcon={() => null}
            maxWidthClassName="!max-w-[760px] w-full"
            contentClassName="bg-white px-4 py-3 flex flex-col gap-3 min-h-[360px] max-h-[70vh] overflow-y-auto"
            footer={
                <div className="flex justify-end items-center w-full">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleLanjut}
                        disabled={selectedIds.size === 0}
                        className="rounded-[4px] px-8 font-normal bg-[#15529A] hover:bg-[#0E3E77] text-white disabled:opacity-50"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    placeholder="Filter Kategori..."
                    trailing={
                        loading ? (
                            <LoadingIcon className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                            <SearchIcon className="h-4 w-4 text-slate-400" />
                        )
                    }
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />

                <TextInput
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    placeholder="Filter Merek...."
                    trailing={
                        loading ? (
                            <LoadingIcon className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                            <SearchIcon className="h-4 w-4 text-slate-400" />
                        )
                    }
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </div>

            <div className="flex-1 min-h-[240px] border border-slate-200 rounded-[4px] overflow-x-auto">
                <DataTable wrapperClassName="border-0">
                    <DataTableHeader className="bg-[#607D8B] text-white">
                        <tr>
                            <DataTableHead className="w-px px-3 text-center">
                                <CheckboxField
                                    checked={allChecked}
                                    onChange={handleSelectAll}
                                    containerClassName="flex justify-center"
                                    className="justify-center"
                                    inputClassName="h-4 w-4"
                                />
                            </DataTableHead>
                            <DataTableHead className="w-[200px] px-3 text-sm text-white">
                                Kode Barang
                            </DataTableHead>
                            <DataTableHead className="px-3 text-sm text-white">
                                Nama Barang
                            </DataTableHead>
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => {
                                const idStr = String(p.id);
                                const isChecked = selectedIds.has(idStr);
                                return (
                                    <DataTableRow
                                        key={idStr}
                                        onClick={() => handleToggleRow(idStr)}
                                        className={`cursor-pointer transition ${isChecked ? 'bg-blue-50/70' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <DataTableCell className="w-px px-3 text-center">
                                            <CheckboxField
                                                checked={isChecked}
                                                onChange={() => handleToggleRow(idStr)}
                                                containerClassName="flex justify-center"
                                                className="justify-center pointer-events-none"
                                                inputClassName="h-4 w-4"
                                            />
                                        </DataTableCell>
                                        <DataTableCell className="px-3 text-xs sm:text-sm text-brand-dark">
                                            {p.code || '-'}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 text-xs sm:text-sm text-brand-dark">
                                            {p.name || '-'}
                                        </DataTableCell>
                                    </DataTableRow>
                                );
                            })
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={3}
                                    className="px-3 py-12 text-center text-sm text-slate-500"
                                >
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </WorkspaceDialog>
    );
}
