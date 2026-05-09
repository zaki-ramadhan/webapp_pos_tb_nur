import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import CheckboxField from '@/components/ui/CheckboxField';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    ChevronDownIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionFieldLabel,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildFixedAssetsFormValues(source = {}) {
    return {
        ...source,
        assetAccount: cloneList(source.assetAccount),
        accumulatedDepreciationAccount: cloneList(source.accumulatedDepreciationAccount),
        depreciationExpenseAccount: cloneList(source.depreciationExpenseAccount),
        category: cloneList(source.category),
        branch: cloneList(source.branch),
        department: cloneList(source.department),
        initialLocation: cloneList(source.initialLocation),
        taxCategory: cloneList(source.taxCategory),
        expenseRows: cloneRows(source.expenseRows),
        locationRows: cloneRows(source.locationRows),
        processItems: source.processItems?.length ? [...source.processItems] : [],
        expenseModal: source.expenseModal
            ? {
                  ...source.expenseModal,
                  tabs: (source.expenseModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}

export function resolveFixedAssetsAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

export function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

export function FixedAssetFieldRow({ label, required = false, labelClassName = '', children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

export function FixedAssetLookupField({
    values,
    placeholder,
    searchLabel,
    onRemove = null,
    className = '',
    heightClassName = 'h-[40px]',
}) {
    return (
        <ChipLookupField
            values={values}
            placeholder={placeholder}
            searchLabel={searchLabel}
            onRemove={onRemove}
            className={className}
            heightClassName={heightClassName}
        />
    );
}

export function InlineCheckboxField({ checked, label = 'Ya', disabled = false }) {
    return (
        <CheckboxField
            checked={checked}
            readOnly
            disabled={disabled}
            onChange={() => {}}
            label={label}
            size="md"
            align="center"
            containerClassName="w-auto"
            className="gap-2 text-[15px]"
            labelClassName="text-[15px]"
        />
    );
}

export function FixedAssetsProcessButton({ items = [] }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="inline-flex h-[34px] items-center overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                aria-label="Proses aset"
            >
                <span className="inline-flex items-center justify-center px-4 text-[15px]">Proses</span>
                <span className="inline-flex h-full w-[30px] items-center justify-center border-l border-l-[#7aa2d5]">
                    <ChevronDownIcon className="h-4 w-4" />
                </span>
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[190px]"
            >
                <div className="flex flex-col">
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                                item.onClick?.();
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

export function FixedAssetsSummary({ values }) {
    return (
        <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:grid-cols-2">
            <TransactionTotalCard
                label="Total Aset"
                value={values.totalAssetValue}
                className="max-w-none rounded-none border-0 shadow-none sm:border-r sm:border-r-[#d8dde7]"
            />
            <TransactionTotalCard
                label="Nilai Buku"
                value={values.bookValue}
                className="max-w-none rounded-none border-0 shadow-none"
            />
        </div>
    );
}
