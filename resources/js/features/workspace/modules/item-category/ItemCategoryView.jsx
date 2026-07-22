import { useEffect, useMemo, useState } from 'react';
import ItemCategoryFormView from './ItemCategoryFormView';
import ItemCategoryTableView from './ItemCategoryTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';

export default function ItemCategoryView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
    const {
        rows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to,
    } = useBackendIndexResource({
        resource: 'product-categories',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = page.itemCategory;
        const mappedRows = rows.map((row) => {
            const inv = row.inventory_account ?? row.inventoryAccount;
            const exp = row.expense_account ?? row.expenseAccount;
            const sal = row.sales_account ?? row.salesAccount;
            const salRet = row.sales_return_account ?? row.salesReturnAccount;
            const salDisc = row.sales_discount_account ?? row.salesDiscountAccount;
            const transit = row.goods_in_transit_account ?? row.goodsInTransitAccount;
            const cogs = row.cost_of_goods_sold_account ?? row.costOfGoodsSoldAccount;
            const purRet = row.purchase_return_account ?? row.purchaseReturnAccount;
            const unbilled = row.unbilled_purchase_account ?? row.unbilledPurchaseAccount;

            return {
                id: String(row.id),
                code: row.code ?? '',
                name: row.name ?? '',
                defaultLabel: row.is_default ? 'Ya' : 'Tidak',
                isDefault: Boolean(row.is_default),
                isSubCategory: Boolean(row.parent_id),
                isSubCategoryText: row.parent_id ? 'Ya' : 'Tidak',
                tabLabel: row.name ?? '',
                
                // Pemetaan akun tambahan untuk kolom settings
                inventoryAccountLabel: inv ? `[${inv.code}] ${inv.name}` : '-',
                expenseAccountLabel: exp ? `[${exp.code}] ${exp.name}` : '-',
                salesAccountLabel: sal ? `[${sal.code}] ${sal.name}` : '-',
                salesReturnAccountLabel: salRet ? `[${salRet.code}] ${salRet.name}` : '-',
                salesDiscountAccountLabel: salDisc ? `[${salDisc.code}] ${salDisc.name}` : '-',
                goodsInTransitAccountLabel: transit ? `[${transit.code}] ${transit.name}` : '-',
                costOfGoodsSoldAccountLabel: cogs ? `[${cogs.code}] ${cogs.name}` : '-',
                purchaseReturnAccountLabel: purRet ? `[${purRet.code}] ${purRet.name}` : '-',
                unbilledPurchaseAccountLabel: unbilled ? `[${unbilled.code}] ${unbilled.name}` : '-',
                isActiveText: row.is_active !== false ? 'Tidak' : 'Ya',
            };
        });

        const detailRecords = {
            ...(baseConfig.detailRecords ?? {}),
        };
        rows.forEach((row) => {
            const inv = row.inventory_account ?? row.inventoryAccount;
            const exp = row.expense_account ?? row.expenseAccount;
            const sal = row.sales_account ?? row.salesAccount;
            const salRet = row.sales_return_account ?? row.salesReturnAccount;
            const salDisc = row.sales_discount_account ?? row.salesDiscountAccount;
            const transit = row.goods_in_transit_account ?? row.goodsInTransitAccount;
            const cogs = row.cost_of_goods_sold_account ?? row.costOfGoodsSoldAccount;
            const purRet = row.purchase_return_account ?? row.purchaseReturnAccount;
            const unbilled = row.unbilled_purchase_account ?? row.unbilledPurchaseAccount;

            detailRecords[String(row.id)] = {
                name: row.name ?? '',
                isDefault: Boolean(row.is_default),
                isSubCategory: Boolean(row.parent_id),
                parentId: row.parent_id ? String(row.parent_id) : '',
                parentName: (row.parent?.name) ?? '',
                accounts: {
                    inventoryAccount: inv ? `[${inv.code}] ${inv.name}` : '',
                    expenseAccount: exp ? `[${exp.code}] ${exp.name}` : '',
                    salesAccount: sal ? `[${sal.code}] ${sal.name}` : '',
                    salesReturnAccount: salRet ? `[${salRet.code}] ${salRet.name}` : '',
                    salesDiscountAccount: salDisc ? `[${salDisc.code}] ${salDisc.name}` : '',
                    goodsInTransitAccount: transit ? `[${transit.code}] ${transit.name}` : '',
                    costOfGoodsSoldAccount: cogs ? `[${cogs.code}] ${cogs.name}` : '',
                    purchaseReturnAccount: purRet ? `[${purRet.code}] ${purRet.name}` : '',
                    unbilledPurchaseAccount: unbilled ? `[${unbilled.code}] ${unbilled.name}` : '',
                }
            };
        });

        return {
            ...baseConfig,
            detailRecords,
            table: {
                loading,

                ...baseConfig.table,
                columns: (() => {
                    const baseCols = baseConfig.table?.columns ?? [];
                    const extraCols = [
                        { id: 'isSubCategoryText', label: 'Sub Kategori', widthClassName: 'w-[130px]', align: 'center', defaultHidden: true },
                        { id: 'inventoryAccountLabel', label: 'Akun Persediaan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'expenseAccountLabel', label: 'Akun Beban', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'salesAccountLabel', label: 'Akun Penjualan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'salesReturnAccountLabel', label: 'Akun Retur Penjualan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'salesDiscountAccountLabel', label: 'Akun Diskon Penjualan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'goodsInTransitAccountLabel', label: 'Akun Barang Terkirim', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'costOfGoodsSoldAccountLabel', label: 'Akun HPP', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'purchaseReturnAccountLabel', label: 'Akun Retur Pembelian', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'unbilledPurchaseAccountLabel', label: 'Akun Belum Tertagih', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'isActiveText', label: 'Non Aktif', widthClassName: 'w-[110px]', align: 'center', defaultHidden: true }
                    ];
                    const filteredExtra = extraCols.filter(col => !baseCols.some(bc => bc.id === col.id));
                    return [...baseCols, ...filteredExtra];
                })(),
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: baseConfig.table?.refreshLabel || 'Muat ulang',
                onRefresh: reload,
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
            },
        };
    }, [loading, page.itemCategory, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage, reload]);

        const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <ItemCategoryTableView page={{ itemCategory: config }} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
            </div>
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <ItemCategoryFormView
                            key={tab.id}
            page={{ itemCategory: config }}
            activeLevel2Tab={tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}

