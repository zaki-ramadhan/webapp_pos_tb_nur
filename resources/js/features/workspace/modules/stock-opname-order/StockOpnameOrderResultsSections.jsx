import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { LinkIcon } from '@/features/workspace/shared/Icons';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

export function StockOpnameOrderResultsSection({ config, values, onOpenItem }) {
    const [searchValue, setSearchValue] = useState(values.resultSearch ?? '');
    const [filterValue, setFilterValue] = useState(values.resultFilter ?? 'all');

    useEffect(() => {
        setSearchValue(values.resultSearch ?? '');
        setFilterValue(values.resultFilter ?? 'all');
    }, [values.resultFilter, values.resultSearch]);

    const rows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return values.resultItems.filter((item) => {
            if (filterValue !== 'all') {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [item.name, item.code, item.systemQuantity, item.countedQuantity, item.unit]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [filterValue, searchValue, values.resultItems]);

    return (
        <SectionCard className="min-h-[620px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-[24px] font-normal text-[#1f2436]">{values.resultCountLabel}</div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <TextInput value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder={config.resultSearchPlaceholder} className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] sm:w-[410px]" inputClassName="text-[15px] text-[#1f2436]" />
                    <SelectField value={filterValue} onChange={(event) => setFilterValue(event.target.value)} containerClassName="w-full sm:w-[410px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                        {config.resultFilterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </SelectField>
                </div>
            </div>

            <div className="mt-4 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.resultTable.columns}
                    rows={rows}
                    emptyLabel={config.resultTable.emptyLabel}
                    minWidthClassName="min-w-[1120px]"
                    onRowClick={onOpenItem}
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                />
            </div>
        </SectionCard>
    );
}
