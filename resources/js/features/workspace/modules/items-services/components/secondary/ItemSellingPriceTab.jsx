import { useState, useMemo } from 'react';
import SelectField from '@/components/ui/SelectField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import starterStateImg from '@/features/workspace/modules/bank-inquiry/assets/rekonsiliasi_starter_state.webp';

export default function ItemSellingPriceTab({ values = {}, detailRow = null }) {
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const baseUnit = values.primaryUnit?.[0] ?? detailRow?.base_unit ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values.unitName ?? 'PCS'));
    const basePrice = parseAmountInput(values.sellPriceLevel1 ?? detailRow?.default_sale_price ?? 0);
    const conversions = Array.isArray(values.unitConversions)
        ? values.unitConversions
        : (Array.isArray(detailRow?.conversions) ? detailRow.conversions : []);

    const priceRows = useMemo(() => {
        const rows = [
            {
                id: 'base',
                unitName: baseUnitName,
                ratioText: 'Satuan 1 (Utama)',
                price: basePrice,
            },
        ];

        conversions.forEach((conv, idx) => {
            const unitName = conv.unitName ?? conv.unit?.[0]?.name ?? conv.name ?? `Satuan ${idx + 2}`;
            const ratio = Number(conv.quantity || 1);
            rows.push({
                id: conv.id ?? `conv-${idx}`,
                unitName,
                ratioText: `1 ${unitName} = ${ratio} ${baseUnitName}`,
                price: basePrice * ratio,
            });
        });

        return rows;
    }, [baseUnitName, basePrice, conversions]);

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setHasLoaded(true);
            setLoading(false);
        }, 200);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="w-[180px]">
                    <SelectField
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="h-[34px] rounded-[4px] border-ui-border"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
                        options={[
                            { value: 'all', label: 'Semua Cabang' },
                        ]}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    aria-label="Muat ulang harga jual"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer disabled:opacity-60"
                >
                    <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Section Headings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div>
                    <h3 className="text-base sm:text-lg font-normal text-[#0089d0]">
                        Harga Berlaku Saat Ini
                    </h3>
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-normal text-[#0089d0]">
                        Harga Jual Mendatang
                    </h3>
                </div>
            </div>

            {/* Content Area */}
            {!hasLoaded ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <img
                        src={starterStateImg}
                        alt="Klik button “Refresh” untuk memperbaharui data"
                        className="w-36 sm:w-44 h-auto object-contain mb-4 opacity-60"
                        style={{ filter: 'saturate(0.3)' }}
                    />
                    <p className="text-sm font-normal text-slate-500">
                        Klik button “Refresh” untuk memperbaharui data
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Harga Berlaku Saat Ini */}
                    <div className="border border-ui-border rounded-[4px] overflow-hidden">
                        <DataTable wrapperClassName="border-0">
                            <DataTableHeader className="bg-[#466986] text-white font-normal">
                                <DataTableRow>
                                    <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">
                                        Satuan
                                    </DataTableHead>
                                    <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">
                                        Rasio Konversi
                                    </DataTableHead>
                                    <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm">
                                        Harga Jual
                                    </DataTableHead>
                                </DataTableRow>
                            </DataTableHeader>
                            <DataTableBody>
                                {priceRows.map((row, idx) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-ui-border-row ${idx % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`}
                                    >
                                        <DataTableCell className="text-left text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">
                                            {row.unitName}
                                        </DataTableCell>
                                        <DataTableCell className="text-left text-xs sm:text-sm text-slate-500 px-3 py-2 font-normal">
                                            {row.ratioText}
                                        </DataTableCell>
                                        <DataTableCell className="text-right text-xs sm:text-sm text-text-workspace-dark px-3 py-2 font-normal">
                                            {formatAmountInput(row.price) || '0'}
                                        </DataTableCell>
                                    </DataTableRow>
                                ))}
                            </DataTableBody>
                        </DataTable>
                    </div>

                    {/* Harga Jual Mendatang */}
                    <div className="border border-ui-border rounded-[4px] overflow-hidden">
                        <DataTable wrapperClassName="border-0">
                            <DataTableHeader className="bg-[#466986] text-white font-normal">
                                <DataTableRow>
                                    <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">
                                        Tanggal Mulai
                                    </DataTableHead>
                                    <DataTableHead className="text-left text-white font-normal px-3 py-2 text-xs sm:text-sm">
                                        Satuan
                                    </DataTableHead>
                                    <DataTableHead className="text-right text-white font-normal px-3 py-2 text-xs sm:text-sm">
                                        Harga Baru
                                    </DataTableHead>
                                </DataTableRow>
                            </DataTableHeader>
                            <DataTableBody>
                                <DataTableRow className="border-ui-border-row bg-white">
                                    <DataTableCell colSpan={3} className="px-3 py-4 text-center text-xs sm:text-sm text-slate-500 font-normal">
                                        Belum ada jadwal penyesuaian harga mendatang
                                    </DataTableCell>
                                </DataTableRow>
                            </DataTableBody>
                        </DataTable>
                    </div>
                </div>
            )}
        </div>
    );
}
